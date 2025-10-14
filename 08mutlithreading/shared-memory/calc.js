const { workerData, threadId } = require("worker_threads");

const data = Buffer.from(workerData.data);
const data2 = Buffer.from(workerData.data2);

console.log(`Thread ${threadId} data: `, data);

data[threadId] = 255;
data2[threadId] = 100;
