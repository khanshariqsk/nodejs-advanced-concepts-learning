const dgram = require("node:dgram");

const receiver = dgram.createSocket("udp4");

receiver.on("message", (message, remoteInfo) => {
  console.log(
    `Server got: ${message} from ${remoteInfo.address}:${remoteInfo.port}`
  );
});

receiver.on("listening", () => {
  console.log("Server listening", receiver.address());
});

receiver.bind({
  address: "127.0.0.1",
  port: 8000,
});
