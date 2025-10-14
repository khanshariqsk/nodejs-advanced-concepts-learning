const { parentPort, workerData } = require("worker_threads");
const generatePrimes = require("./prime-generator");
const factorial = require("./factorial");

const primes = new BigUint64Array(workerData.primes);
const primesSeal = new Int32Array(workerData.primesSeal);
const numbers = new BigUint64Array(workerData.numbers);
const numbersSeal = new Int32Array(workerData.numbersSeal);

function lock(seal) {
  // If seal is 0, stores 1 to it. Always returns the old value
  while (Atomics.compareExchange(seal, 0, 0, 1) !== 0) {
    Atomics.wait(seal, 0, 1); // if seal is 1, stop the execution
  }
}

function unlock(seal) {
  Atomics.store(seal, 0, 0); // unseal (set the seal to 0)
  Atomics.notify(seal, 0, 20);
}

// Function to generate numbers (memory-intensive). Used to demonstrate how much faster it is to use shared memory.
const generateNumbers = (count, start) => {
  const numbers = [];
  for (let i = 0n; i < count; i++) {
    numbers.push(start + i);
  }
  return numbers;
};

parentPort.on("message", ({ taskName, options }) => {
  switch (taskName) {
    case "generatePrimes":
      const generatedPrimes = generatePrimes(options.count, options.start, {
        format: options.format,
        log: options.log,
      });

      lock(primesSeal);
      primes.set(generatedPrimes, primes.indexOf(0n));
      unlock(primesSeal);

      parentPort.postMessage("done");
      break;
    case "factorial":
      const result = factorial(options.n);
      parentPort.postMessage(result);
      break;
    case "generateNumbers":
      const generatedNumbers = generateNumbers(options.count, options.start);

      lock(numbersSeal);
      numbers.set(generatedNumbers, numbers.indexOf(0n));
      unlock(numbersSeal);

      parentPort.postMessage("done");
      break;
    default:
      parentPort.postMessage("Unknown task");
  }
});
