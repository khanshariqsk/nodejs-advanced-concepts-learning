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

lock(A);

// Doing some operations...

lock(B);

console.log(`${threadId} doing work with both A & B...`);

unlock(A);

// Do more work...

unlock(B);

// Below is another example of a deadlock where a thread that locks, forgets to unlock.
// Use this snippet with the code in the semaphores folder.
// for (let i = 0; i < 1_000_000; i++) {
//   // This is our critical section

//   try {
//     lock(seal);

//     number[0] = number[0] + 1;

//     if (number[0] === 1000) {
//       throw "err";
//     }
//   } catch (e) {
//     console.log(e);
//   } finally {
//     unlock(seal);
//   }
// }
