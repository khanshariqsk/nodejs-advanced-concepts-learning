const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Encrypt extends Transform {
  _transform(chunk, encoding, callback) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }
    callback(null, chunk);
  }
}

(async () => {
  const readFile = await fs.open("read.txt", "r");
  const writeFile = await fs.open("write.txt", "w");

  const readFileStream = readFile.createReadStream();
  const writeFileStream = writeFile.createWriteStream();

  const transformStream = new Encrypt();

  readFileStream.pipe(transformStream).pipe(writeFileStream);

  //   readFile.close();
  //   writeFile.close();
})();
