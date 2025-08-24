const fs = require("node:fs/promises");
const { pipeline } = require("node:stream");

//Copy Using My Own Way
// (async () => {
//   console.time("Copy");
//   const readFile = await fs.open("./text.txt", "r");
//   const writeFile = await fs.open("./copy-text.txt", "w");

//   while (true) {
//     const readData = await readFile.read();
//     if (!readData.bytesRead) break;

//     if (readData.bytesRead !== 16384) {
//       writeFile.write(readData.buffer.subarray(0, readData.bytesRead));
//     } else {
//       writeFile.write(readData.buffer);
//     }
//   }

//   console.timeEnd("Copy");
//   await readFile.close();
//   await writeFile.close();
// })();

//Copy Using Pipe
// (async () => {
//   console.time("Copy");
//   const readFile = await fs.open("./text.txt", "r");
//   const writeFile = await fs.open("./copy-text.txt", "w");

//   const readStream = readFile.createReadStream();
//   const writeStream = writeFile.createWriteStream();

//   readStream.pipe(writeStream);

//   writeStream.on("finish", async () => {
//     console.timeEnd("Copy");
//     await readFile.close();
//     await writeFile.close();
//   });
// })();

//Copy Using Pipeline Method Of Stream Module
(async () => {
  console.time("Copy");
  const readFile = await fs.open("./text.txt", "r");
  const writeFile = await fs.open("./copy-text.txt", "w");

  const readStream = readFile.createReadStream();
  const writeStream = writeFile.createWriteStream();

  pipeline(readStream, writeStream, async (err) => {
    if (err) {
      console.log(err);
    }

    console.timeEnd("Copy");
    await readFile.close();
    await writeFile.close();
  });
})();
