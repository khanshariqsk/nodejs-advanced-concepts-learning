const { workerData, parentPort } = require("worker_threads");
const zlib = require("zlib");
const fs = require("fs");

const data = fs.readFileSync("./text.txt");

function compressSync() {
  try {
    zlib.deflateSync(data);
    return "done";
  } catch (err) {
    console.error("An error occurred:", err);
    throw err;
  }
}

const totalIterations = workerData.count; // total number of times to compress

for (let i = 0; i < totalIterations; i++) {
  try {
    compressSync();
  } catch (err) {
    console.error("Error compressing:", err);
  }
}

parentPort.postMessage("done");
