const http = require("http");

// Send one request
function sendRequest(hostname, port, path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: path,
      method: method,
    };

    const req = http.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        resolve(Buffer.concat(chunks).toString());
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}

module.exports = sendRequest;
