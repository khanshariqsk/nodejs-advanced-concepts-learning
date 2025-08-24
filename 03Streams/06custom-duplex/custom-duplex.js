const { Duplex } = require("node:stream");
const fs = require("node:fs");

/**
 * Custom Duplex stream that reads from one file and writes to another.
 * Duplex = Readable + Writable combined into a single object.
 */
class DuplexStream extends Duplex {
  constructor({
    readableHighWaterMark,
    writableHighWaterMark,
    readFileName,
    writeFileName,
  }) {
    // Pass buffering configs to parent Duplex constructor
    super({ readableHighWaterMark, writableHighWaterMark });

    // File paths for reading and writing
    this.readFileName = readFileName;
    this.writeFileName = writeFileName;

    // File descriptors (will be opened in _construct)
    this.readFd = null;
    this.writeFd = null;

    // Position tracker for reading file progressively
    this.position = 0;

    // Internal write buffer
    this.chunks = [];
    this.chunkSize = 0;
  }

  /**
   * Called before any read/write — good place to open resources.
   */
  _construct(callback) {
    // Open file for reading
    fs.open(this.readFileName, "r", (err, readFd) => {
      if (err) return callback(err);
      this.readFd = readFd;

      // Open file for writing
      fs.open(this.writeFileName, "w", (err, writeFd) => {
        if (err) return callback(err);
        this.writeFd = writeFd;
        callback(); // Signals ready for use
      });
    });
  }

  /**
   * Handles incoming write() calls.
   */
  _write(chunk, encoding, callback) {
    this.chunkSize += chunk.length;
    this.chunks.push(chunk);

    // If buffered enough data, flush to disk
    if (this.chunkSize >= this.writableHighWaterMark) {
      fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
        if (err) return callback(err);
        callback(); // Notify stream system write is complete
        this.chunks = [];
        this.chunkSize = 0;
      });
    } else {
      // Don't flush yet, just mark ready for next write
      callback();
    }
  }

  /**
   * Handles data requests from the readable side.
   */
  _read(size) {
    const buffer = Buffer.alloc(size);

    fs.read(this.readFd, buffer, 0, size, this.position, (err, bytesRead) => {
      if (err) return this.destroy(err);

      if (bytesRead > 0) {
        // Move the file cursor forward
        this.position += bytesRead;

        // Push only actual bytes read
        if (size !== bytesRead) {
          this.push(buffer.subarray(0, bytesRead));
        } else {
          this.push(buffer);
        }
      } else {
        // No more data → end readable side
        this.push(null);
      }
    });
  }

  /**
   * Called when writable side ends (end() called).
   * Flush any pending chunks before finishing.
   */
  _final(callback) {
    if (this.chunks.length > 0) {
      fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
        if (err) return callback(err);
        this.chunks = [];
        this.chunkSize = 0;
        callback();
      });
    } else {
      callback();
    }
  }

  /**
   * Clean up resources on stream destroy.
   */
  _destroy(err, callback) {
    const closeRead = this.readFd
      ? new Promise((resolve) => {
          fs.close(this.readFd, () => resolve());
        })
      : Promise.resolve();

    const closeWrite = this.writeFd
      ? new Promise((resolve) => {
          fs.close(this.writeFd, () => resolve());
        })
      : Promise.resolve();

    Promise.all([closeRead, closeWrite])
      .then(() => callback(err))
      .catch((closeErr) => callback(closeErr || err));
  }
}

// Instantiate custom duplex stream
const duplexStream = new DuplexStream({
  readableHighWaterMark: 16 * 1024, // Read buffer size
  writableHighWaterMark: 16 * 1024, // Write buffer size
  readFileName: "read.txt",
  writeFileName: "write.txt",
});

// Listen for data from readable side
duplexStream.on("data", (chunk) => {
  console.log(chunk.toString("utf-8"));
});

// Write some data to writable side
duplexStream.write(Buffer.from("Hello People"));
duplexStream.end();
