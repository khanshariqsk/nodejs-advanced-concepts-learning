const fs = require("node:fs");
const { Readable, Writable } = require("node:stream");

class FileWriteStream extends Writable {
  constructor({ highWaterMark, filename }) {
    // Pass highWaterMark to the Writable base class
    super({ highWaterMark });

    this.filename = filename;
    this.fd = null; // File descriptor will be assigned in _construct

    this.chunks = [];
    this.chunkSize = 0;
    this.numberOfWrites = 0;
  }

  /**
   * _construct is called before any writes happen.
   * Good place to open resources like files or network connections.
   */
  _construct(callback) {
    fs.open(this.filename, "w", (err, fd) => {
      if (err) return callback(err);
      this.fd = fd;
      callback(); // Ready to start writing
    });
  }

  /**
   * _write is called every time stream.write() is called
   * until highWaterMark is reached (then backpressure kicks in).
   */
  _write(chunk, encoding, callback) {
    this.chunkSize += chunk.length;
    this.chunks.push(chunk);

    if (this.chunkSize >= this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) return callback(err);
        callback(); // Tell Node this chunk is written — request next
        this.chunks = [];
        this.chunkSize = 0;
        this.numberOfWrites += 1;
      });
    } else {
      callback();
    }
  }

  /**
   * _final is called when stream.end() is called
   * and all written data has been flushed.
   * Good place to write any remaining data.
   */
  _final(callback) {
    if (this.chunks.length > 0) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) return callback(err);
        this.chunks = [];
        this.chunkSize = 0;
        callback();
        this.numberOfWrites += 1;
      });
    } else {
      callback();
    }
  }

  /**
   * _destroy is called when inside the _final() method callback() function gets called OR is destroyed manually.
   * Good place to clean up resources like closing file descriptors.
   */
  _destroy(error, callback) {
    if (this.fd) {
      fs.close(this.fd, (err) => {
        console.log("File closed — destroyed");
        callback(err || error);
        console.log("Number of Writes", this.numberOfWrites);
      });
    } else {
      callback(error);
    }
  }
}

class FileReadStream extends Readable {
  constructor({ filename, highWaterMark }) {
    // Pass highWaterMark to the parent constructor
    super({ highWaterMark });
    this.filename = filename;
    this.fd = null; // File descriptor
    this.position = 0; // Tracks where we are in the file
  }

  // Called once when the stream is created
  _construct(callback) {
    fs.open(this.filename, "r", (err, fd) => {
      if (err) return callback(err);
      this.fd = fd;
      callback();
    });
  }

  /**
   * _read(size) is called internally when the stream
   * needs more data to push to the consumer.
   */
  _read(size) {
    const buffer = Buffer.alloc(size);

    // If null is passed for this.position in fs.read, the OS keeps track of the current position automatically but I am handling it manually

    fs.read(this.fd, buffer, 0, size, this.position, (err, bytesRead) => {
      if (err) return this.destroy(err);

      if (bytesRead > 0) {
        this.position += bytesRead; // Move forward in file
        if (size !== bytesRead) {
          this.push(buffer.subarray(0, bytesRead)); // Push only the read bytes
        } else {
          this.push(buffer);
        }
      } else {
        // No more data → signal end of stream
        this.push(null);
      }
    });
  }

  // Called when the stream ends or is destroyed
  _destroy(err, callback) {
    if (this.fd) {
      fs.close(this.fd, (closeErr) => {
        callback(err || closeErr);
      });
    } else {
      callback(err);
    }
  }
}

console.time("Time To Write");

// Example usage
const readStream = new FileReadStream({
  filename: "src.txt",
  highWaterMark: 16 * 1024,
});

const writeStream = new FileWriteStream({
  filename: "dest.txt",
  highWaterMark: 16 * 1024,
});

writeStream.on("drain", () => {
  readStream.resume();
});

readStream.on("data", (chunk) => {
  const canContinue = writeStream.write(chunk);
  if (!canContinue) {
    readStream.pause();
  }
});

readStream.on("end", () => {
  console.log("Finished reading file");
  console.timeEnd("Time To Write");
  writeStream.end();
});

readStream.on("error", (err) => {
  console.error("Error:", err);
});
