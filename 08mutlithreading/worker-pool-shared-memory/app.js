const Pool = require("./pool");
const { performance } = require("perf_hooks");

// Clear a line in the console
const clearLine = (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

// Move the cursor in the console
const moveCursor = (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const numWorkers = 4;

let tasksDone = 0;
const totalTasks = 10_000;
const count = 80;
const batchSize = 200;
let batchIndex = 0;
const start = performance.now();

const pool = new Pool(numWorkers, totalTasks * count);

function submitBatch(startIndex, endIndex) {
  let batchTaskCount = 0;

  for (let i = startIndex; i < endIndex; i++) {
    batchTaskCount++;

    pool.submit(
      "generateNumbers",
      {
        count,
        start: 10_000_000_000n + BigInt(i * 5000),
      },
      async (result) => {
        // Log some statistics every now and then
        if (tasksDone % 100 === 0) {
          await moveCursor(0, -1);
          await clearLine(0);
          await moveCursor(0, -1);
          await clearLine(0);

          console.log(
            `Event loop utilization: ${
              performance.eventLoopUtilization().utilization
            }`
          );
          console.log(
            `Progress ${Math.round((tasksDone / totalTasks) * 100)}%...`
          );
        }

        tasksDone++;
        batchTaskCount--;

        // When all tasks are done
        if (tasksDone === totalTasks) {
          console.log(`Time taken: ${performance.now() - start}ms`);

          console.log(pool.getNumbers()[99900]);
          console.log(pool.getNumbers());

          process.exit(0);
        }

        // When all batch tasks are done
        if (batchTaskCount === 0) {
          batchIndex++;
          submitNextBatch();
        }
      }
    );
  }
}

function submitNextBatch() {
  if (batchIndex * batchSize < totalTasks) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min((batchIndex + 1) * batchSize, totalTasks);
    submitBatch(startIndex, endIndex);
  }
}

// Start the first batch
submitNextBatch();
