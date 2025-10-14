const { Worker } = require("worker_threads");

const numberBuffer = new Uint32Array(new SharedArrayBuffer(4));
const threads = 10;

let completed = 0;

for (let i = 0; i < threads; i++) {
  const worker = new Worker("./calc.js", {
    workerData: numberBuffer.buffer,
  });

  worker.on("exit", () => {
    completed++;

    if (completed === threads) {
      console.log(numberBuffer[0]);
    }
  });
}
