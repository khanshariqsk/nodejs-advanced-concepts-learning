const { workerData } = require("worker_threads");
const sendRequest = require("./sendRequest");

// Send <count> requests all at once
async function sendBatchRequests(count) {
  const requestPromises = [];

  for (let i = 0; i < count; i++) {
    requestPromises.push(
      sendRequest(
        workerData.hostname,
        workerData.port,
        workerData.path,
        workerData.method
      )
    );
  }

  try {
    await Promise.all(requestPromises);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

(async () => {
  let requestsRemaining = workerData.count;
  const batchSize = 150; // total number of requests to send in a batch
  const batches = Math.ceil(workerData.count / batchSize); // total number of batches

  for (let i = 0; i < batches; i++) {
    // Choose the smallest: either bachSize, remaining requests, or total count if less than batchSize.
    // This will be how many requests to send in this batch.
    const reqToSendBatch = Math.min(
      batchSize,
      workerData.count,
      requestsRemaining
    );

    await sendBatchRequests(reqToSendBatch);

    requestsRemaining -= reqToSendBatch;
  }
})();
