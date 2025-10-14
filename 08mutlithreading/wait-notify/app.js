const { Worker } = require("worker_threads");

const flag = new Int32Array(new SharedArrayBuffer(4));

for (let i = 0; i < 8; i++) {
  new Worker("./calc.js", { workerData: { flag: flag.buffer } });
}

setTimeout(() => {
  Atomics.notify(flag, 0, 4);
}, 3000);
