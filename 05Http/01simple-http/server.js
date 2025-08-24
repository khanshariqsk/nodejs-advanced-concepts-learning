const http = require("http");

const server = http.createServer((req, res) => {});

const port = 8050;
const hostName = "localhost";

server.on("request", (req, res) => {
  // Method
  console.log("Request method:", req.method);

  // URL
  console.log("Request URL:", req.url);

  // Headers
  console.log("Request headers:", req.headers);

  let data = "";

  // Body (if any)
  req.on("data", (chunk) => {
    data += chunk.toString("utf-8");
  });

  req.on("end", () => {
    console.log("Request body:", JSON.parse(data));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Post created successfully!" }));
  });
});

server.listen(port, hostName, () => {
  console.log("Server is listening on", server.address());
});
