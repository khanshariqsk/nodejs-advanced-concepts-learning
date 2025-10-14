const net = require("net");

// The listening event gets emitted in a process.nextTick
const server = net.createServer(() => {}).listen(8080);

server.on("listening", () => {
  console.log("Listening...");
});
