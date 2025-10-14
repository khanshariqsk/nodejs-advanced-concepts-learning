const Pool = require("./pool");

const numWorkers = 8;
const pool = new Pool(numWorkers);

const startTime = performance.now();

let results = [];
const tasksCount = 1000;
let completedTask = 0;

for (let i = 0; i < tasksCount; i++) {
  pool.submit(
    "generatePrimes",
    {
      count: 5,
      start: 10_000_000_000_000,
      format: true,
      log: false,
    },
    (primes) => {
      results.concat(primes);
      completedTask++;

      if (completedTask === tasksCount) {
        console.log("Time to complete:", performance.now() - startTime, "ms");
        process.exit(0);
      }
    }
  );
}
