const { Worker } = require("worker_threads");
const { performance } = require("perf_hooks");

process.title = "node-rs";

const THREADS = 4;
const count = 100_000;
let completed = 0;

for (let i = 0; i < THREADS; i++) {
  const start = performance.now();

  const worker = new Worker("./calc-batch.js", {
    workerData: {
      count: count / THREADS,
      hostname: "localhost",
      port: 8090,
      path: "/api/get-json-data",
      method: "GET",
    },
  });

  const threadId = worker.threadId;
  console.log(`Worker ${threadId} started`);

  worker.on("message", (msg) => {});

  worker.on("error", (err) => {
    console.error(err);
  });

  worker.on("exit", (code) => {
    console.log(`Worker ${threadId} exited.`);

    completed++;

    if (completed === THREADS) {
      console.log(`Time taken: ${(performance.now() - start) / 1000}s`);
    }

    if (code !== 0) {
      console.error(`Worker exited with code ${code}`);
    }
  });
}
