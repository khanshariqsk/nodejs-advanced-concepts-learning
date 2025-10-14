const { workerData, threadId } = require("worker_threads");

const bufferNumber = new Uint32Array(workerData);

for (let i = 0; i < 5000; i++) {
  // bufferNumber[0] = bufferNumber[0] + 1;

  Atomics.add(bufferNumber, 0, 1);
}
