const db = require("../src/DB");
const FF = require("../lib/FF");
const util = require("../lib/util");

class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;

    db.update();
    db.videos.forEach((video) => {
      for (const resizeKey in video.resizes) {
        if (video.resizes[resizeKey]?.processing) {
          const [width, height] = resizeKey.split("x");

          this.enqueue({
            type: "resize",
            videoId: video.videoId,
            width,
            height,
          });
        }
      }
    });
  }

  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }

  dequeue() {
    return this.jobs.shift();
  }

  executeNext() {
    if (this.currentJob) return;
    this.currentJob = this.dequeue();
    if (!this.currentJob) return;

    this.execute(this.currentJob);
  }

  async execute(job) {
    if (job.type === "resize") {
      db.update();
      const video = db.videos.find((video) => video.videoId === job.videoId);

      const originalVideoPath = `./storage/${video.videoId}/original.${video.extension}`;
      const targetVideoPath = `./storage/${video.videoId}/${job.width}x${job.height}.${video.extension}`;

      try {
        await FF.resize(
          originalVideoPath,
          targetVideoPath,
          job.width,
          job.height
        );

        db.update();
        const video = db.videos.find((video) => video.videoId === job.videoId);

        video.resizes[`${job.width}x${job.height}`].processing = false;

        db.save();
      } catch (error) {
        util.deleteFile(targetVideoPath);
      }
    }

    this.currentJob = null;
    this.executeNext();
  }
}

module.exports = JobQueue;
