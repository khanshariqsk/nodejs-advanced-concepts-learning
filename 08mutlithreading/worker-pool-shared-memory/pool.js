const { Worker } = require("worker_threads");
const path = require("path");

class Pool {
  constructor(threadCount, totalItemsCount) {
    this.threadCount = threadCount; // number of threads that will be spawned
    this.threads = []; // all of our worker threads (same length as threadCount)
    this.idleThreads = []; // threads that are not currently working
    this.scheduledTasks = []; // queue of tasks that need to be executed - these are not currently running in one of the threads

    this.primes = new SharedArrayBuffer((totalItemsCount * 64) / 8);
    this.primesSeal = new SharedArrayBuffer(4);
    this.numbers = new SharedArrayBuffer((totalItemsCount * 64) / 8);
    this.numbersSeal = new SharedArrayBuffer(4);

    // Spawn the threads
    for (let i = 0; i < threadCount; i++) {
      this.spawnThread();
    }
  }

  spawnThread() {
    const worker = new Worker(path.join(__dirname, "calc.js"), {
      workerData: {
        numbers: this.numbers,
        numbersSeal: this.numbersSeal,
        primes: this.primes,
        primesSeal: this.primesSeal,
      },
    });

    // When we get a message from a worker, it means that it has finished its task
    worker.on("message", (result) => {
      const { callback } = worker.currentTask;

      if (callback) {
        callback(result);
      }

      this.idleThreads.push(worker);
      this.runNextTask();
    });

    this.threads.push(worker);
    this.idleThreads.push(worker); // initially, all threads are idle
  }

  runNextTask() {
    if (this.scheduledTasks.length > 0 && this.idleThreads.length > 0) {
      const worker = this.idleThreads.shift();
      const { taskName, options, callback } = this.scheduledTasks.shift();

      worker.currentTask = { taskName, options, callback };

      // Tell a worker to start executing that task
      worker.postMessage({ taskName, options });
    }
  }

  submit(taskName, options, callback) {
    this.scheduledTasks.push({ taskName, options, callback });
    this.runNextTask();
  }

  getPrimes() {
    return Array.from(new BigUint64Array(this.primes).sort());
  }

  getNumbers() {
    return Array.from(new BigUint64Array(this.numbers).sort());
  }
}

module.exports = Pool;
