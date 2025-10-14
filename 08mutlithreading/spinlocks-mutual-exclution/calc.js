const { workerData, threadId } = require("worker_threads");

const numberBuffer = new Int32Array(workerData.numberBuffer);
const seal = new Int32Array(workerData.seal);

for (let i = 0; i < 5_000_000; i++) {
  while (Atomics.compareExchange(seal, 0, 0, 1) === 1) {}

  // console.log({ threadId });

  numberBuffer[0] = numberBuffer[0] + 1;
  Atomics.store(seal, 0, 0);
}
