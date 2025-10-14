const { workerData, threadId } = require("worker_threads");

const number = new Uint32Array(workerData.number);
const A = new Int32Array(workerData.A);
const B = new Int32Array(workerData.B);

function lock(seal) {
  // If seal is 0, stores 1 to it. Always returns the old value.
  while (Atomics.compareExchange(seal, 0, 0, 1) === 1) {
    Atomics.wait(seal, 0, 1); // If seal is 1, stop the execution
  }
}

function unlock(seal) {
  Atomics.store(seal, 0, 0); // unseal (set the seal back to 0)
  Atomics.notify(seal, 0, 1); // wake up one suspended thread
}

lock(B);

// Doing some work...

lock(A);

console.log(`${threadId} doing work with both B & A...`);

unlock(B);

unlock(A);
