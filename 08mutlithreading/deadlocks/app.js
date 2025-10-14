const { Worker } = require("worker_threads");

// Imagine we've got another shared resource...
const number = new Uint32Array(new SharedArrayBuffer(4)); // 32-bit number

const A = new SharedArrayBuffer(4);
const B = new SharedArrayBuffer(4);

new Worker("./calc1.js", {
  workerData: { number: number.buffer, A, B },
});

new Worker("./calc2.js", {
  workerData: { number: number.buffer, A, B },
});
