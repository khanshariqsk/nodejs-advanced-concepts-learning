const { Worker } = require("worker_threads");
const path = require("path");

class Pool {
  constructor(threadCount) {
    this.threadCount = threadCount;
    this.threads = [];
    this.idleThreads = [];
    this.scheduledTasks = [];

    for (let i = 0; i < threadCount; i++) {
      this.spawnThread();
    }
  }

  spawnThread() {
    const worker = new Worker(path.join(__dirname, "calc.js"));

    worker.on("message", (result) => {
      this.idleThreads.push(worker);

      const { callback } = worker.currentTask;

      if (callback) {
        callback(result);
      }

      this.runNextTask();
    });

    this.threads.push(worker);
    this.idleThreads.push(worker);
  }

  runNextTask() {
    if (this.scheduledTasks.length === 0 || this.idleThreads.length === 0)
      return;

    const { taskName, options, callback } = this.scheduledTasks.shift();

    const worker = this.idleThreads.shift();
    worker.currentTask = { taskName, options, callback };

    worker.postMessage({ taskName, options });
  }

  submit(taskName, options, callback) {
    this.scheduledTasks.push({ taskName, options, callback });
    this.runNextTask();
  }
}

module.exports = Pool;
