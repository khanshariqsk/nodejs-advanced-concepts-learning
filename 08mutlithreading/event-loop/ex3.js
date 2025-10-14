const { performance } = require("perf_hooks");

// Process nextTick won't work!
setImmediate(() => {
  for (let i = 0; i < 10_000_000_000_000; i++) {
    if (i % 100_000_000 === 0) {
      console.log(performance.eventLoopUtilization());
    }
  }
});
