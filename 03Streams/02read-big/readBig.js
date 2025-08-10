const fs = require("node:fs/promises");

(async () => {
  console.time("Read To Write Time");
  const readFileHandler = await fs.open("./source.txt", "r");
  const writeFileHandler = await fs.open("./dest.txt", "w");

  const highWaterMark = 16 * 1024;

  const readableStream = readFileHandler.createReadStream({ highWaterMark });
  const writableStream = writeFileHandler.createWriteStream({ highWaterMark });

  readableStream.on("data", (chunk) => {
    const numbers = chunk.toString("utf-8").split("  ");

    for (const number of numbers) {
      if (Number(number) % 2 == 0) {
        const canContinue = writableStream.write(` ${number} `);
        if (!canContinue) {
          readableStream.pause(); // pause reading if write buffer is full
        }
      }
    }
  });

  writableStream.on("drain", () => {
    readableStream.resume(); // resume reading when buffer drains
  });

  readableStream.on("end", async () => {
    console.timeEnd("Read To Write Time");
    writableStream.end(); // tell writable stream we're done
    await readFileHandler.close();
    await writeFileHandler.close();
  });

  writableStream.on("finish", () => {
    console.log("✅ File copied successfully.");
  });

  writableStream.on("error", (err) => {
    console.error("❌ Error in writing:", err.message);
  });

  readableStream.on("error", (err) => {
    console.error("❌ Error in reading:", err.message);
  });
})();
