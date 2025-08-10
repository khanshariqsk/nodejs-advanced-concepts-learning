const fs = require("node:fs/promises");

// Without streams
// (async () => {
//   console.time("Time To Write:");
//   const openFile = await fs.open("./text.txt", "w");

//   try {
//     for (let i = 1; i <= 1e6; i++) {
//       await openFile.writeFile(i.toString() + "\n");
//     }
//   } catch (error) {
//     console.log("failed to write the file", error.message);
//   } finally {
//     await openFile.close();
//     console.timeEnd("Time To Write:");
//   }
// })();

// With Streams
// Dont do it this way (Memory consumption is very high)
// (async () => {
//   console.time("Time To Write:");
//   const openFile = await fs.open("./text.txt", "w");
//   const writeStream = openFile.createWriteStream();

//   try {
//     for (let i = 1; i <= 1e6; i++) {
//       writeStream.write(` ${i.toString()} \n`);
//     }
//   } catch (error) {
//     console.log("failed to write the file", error.message);
//   } finally {
//     await openFile.close();
//     console.timeEnd("Time To Write:");
//   }
// })();

// With Streams
// Write way to write to the stream (wait for Stream to flush or drain the internal buffer)
(async () => {
  console.time("Time To Write:");
  const openFile = await fs.open("./text.txt", "w");
  const writeStream = openFile.createWriteStream();

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
    openFile.close();
  });

  writeMany();
})();
