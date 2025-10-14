const { parentPort } = require("worker_threads");
const generatePrimes = require("./prime-generator");
const calculateFactorial = require("./factorial");

const runCalcFn = ({ taskName, options }) => {
  switch (taskName) {
    case "generatePrimes":
      const primes = generatePrimes(options.count, options.start, {
        format: !!options.format,
        log: !!options.log,
      });

      parentPort.postMessage(primes);
    case "factorial":
      const result = calculateFactorial(options.n);
      parentPort.postMessage(result);
      break;
    default:
      parentPort.postMessage("Unknown task");
  }
};

parentPort.on("message", ({ taskName, options }) => {
  runCalcFn({ taskName, options });
});
