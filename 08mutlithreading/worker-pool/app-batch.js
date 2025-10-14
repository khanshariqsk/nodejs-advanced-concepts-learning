const Pool = require("./pool");

const numWorkers = 8;
const pool = new Pool(numWorkers);

const startTime = performance.now();

let results = [];
const tasksCount = 2_000_000;
let completedTask = 0;
let batchIndex = 0;
let batchSize = 1000;

function submitBatch(startIndex, endIndex) {
  let batchTaskCount = 0;

  for (let i = startIndex; i < endIndex; i++) {
    batchTaskCount++;

    pool.submit(
      "generatePrimes",
      {
        count: 5,
        start: 10_000,
        format: true,
        log: false,
      },
      (primes) => {
        results.concat(primes);
        completedTask++;
        batchTaskCount--;

        if (completedTask === tasksCount) {
          console.log("Time to complete:", performance.now() - startTime, "ms");
          process.exit(0);
        }

        if (batchTaskCount === 0) {
          batchIndex++;
          submitNextBatch();
        }
      }
    );
  }
}

function submitNextBatch() {
  if (batchIndex * batchSize < tasksCount) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min((batchIndex + 1) * batchSize, tasksCount);
    submitBatch(startIndex, endIndex);
  }
}

// Start the first batch
submitNextBatch();
