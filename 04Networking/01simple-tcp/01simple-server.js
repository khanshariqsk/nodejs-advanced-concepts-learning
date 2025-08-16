const net = require("net");
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(data.toString("utf-8"));
  });
});

server.listen(3099, "127.0.0.1", () => {
  console.log("Opened server on", server.address());
});
