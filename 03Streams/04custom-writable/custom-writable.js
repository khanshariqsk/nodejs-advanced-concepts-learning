const fs = require("node:fs");
const { Writable } = require("node:stream");

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

// --- Usage Example ---

// const stream = new FileWriteStream({
//   highWaterMark: 10, // 10 bytes internal buffer
//   filename: "text.txt",
// });

// // Write a chunk — will return false if buffer is full (backpressure)
// const canWriteFurther = stream.write(Buffer.from("Hello Shariq Khan"));
// console.log({ canWriteFurther });

// // Final write and signal that no more writes will happen
// stream.end(Buffer.from("One Last Write"));

// // Will be called when the buffer is emptied and writable again
// stream.on("drain", () => {
//   console.log("drained — buffer empty, can write again");
// });

// // Called after _final and cleanup is complete
// stream.on("finish", () => {
//   console.log("finished — all writes done and file closed");
// });

(async () => {
  console.time("Time To Write:");
  const writeStream = new FileWriteStream({
    highWaterMark: 16 * 1024,
    filename: "text.txt",
  });

  let i = 1;
  const writeMany = () => {
    while (i <= 1e6) {
      const canWriteFurther = writeStream.write(` ${i.toString()} `);
      i++;
      if (!canWriteFurther) return;
    }

    writeStream.end();
  };

  writeStream.on("drain", writeMany);
  writeStream.on("finish", () => {
    console.timeEnd("Time To Write:");
  });

  writeMany();
})();
