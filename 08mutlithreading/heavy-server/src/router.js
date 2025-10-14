// Controllers
const User = require("./controllers/user");
const os = require("node:os");
const { Worker } = require("node:worker_threads");

module.exports = (server) => {
  /** test route */
  server.route("get", "/api/get-json-data", (req, res) => {
    // send a big size json data
    res.json({ data: "This is a big size json data".repeat(100) });
  });

  // ------------------------------------------------ //
  // ************ USER ROUTES ************* //
  // ------------------------------------------------ //

  // Log a user in and give them a token
  server.route("post", "/api/login", User.logUserIn);

  // Log a user out
  server.route("delete", "/api/logout", User.logUserOut);

  // Send user info
  server.route("get", "/api/user", User.sendUserInfo);

  // Update a user info
  server.route("put", "/api/user", User.updateUser);

  // ------------------------------------------------ //
  // ************ PRIME NUMBER ROUTES ************* //
  // ------------------------------------------------ //

  server.route("get", "/api/primes", (req, res) => {
    const count = Number(req.params.get("count"));
    let startingNumber = BigInt(req.params.get("start"));
    const start = performance.now();

    if (startingNumber < BigInt(Number.MAX_SAFE_INTEGER)) {
      startingNumber = Number(startingNumber);
    }

    const results = [];

    const worker = new Worker("./lib/calc.js", {
      workerData: {
        count,
        startingNumber,
      },
    });

    const timeoutId = setTimeout(() => {
      worker.terminate();
      res.status(408).json({ message: "Request time out." });
    }, 10000);

    worker.on("message", (primes) => {
      results.push(...primes);
    });

    worker.on("exit", () => {
      clearTimeout(timeoutId);
      res.json({
        primes: results.map((p) => (typeof p === "bigint" ? p.toString() : p)),
        time: ((performance.now() - start) / 1000).toFixed(2),
      });
    });
  });
};
