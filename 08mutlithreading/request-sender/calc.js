const { workerData, parentPort } = require("worker_threads");
const sendRequest = require("./sendRequest");

(async () => {
  try {
    for (let i = 0; i < workerData.count; i++) {
      await sendRequest(
        workerData.hostname,
        workerData.port,
        workerData.path,
        workerData.method
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
