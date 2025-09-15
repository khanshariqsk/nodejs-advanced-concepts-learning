const cluster = require("cluster");
const os = require("os");
const JobQueue = require("./../lib/jobQueue");

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...\n`);

  // Create workers equal to number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Respawn worker if it dies
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log("Starting a new worker...");
    cluster.fork();
  });

  //Manage jobs queue

  const jobs = new JobQueue();

  cluster.on("message", (worker, message) => {
    if (message.messageType === "new-resize") {
      const { videoId, width, height } = message.data;

      jobs.enqueue({
        type: "resize",
        videoId,
        width,
        height,
      });
    }
  });
} else {
  require("./index");
}
