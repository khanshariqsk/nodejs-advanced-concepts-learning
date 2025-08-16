const dgram = require("node:dgram");

const sender = dgram.createSocket({ type: "udp4", sendBufferSize: 20000 });

sender.send(
  "This is a message from sender",
  8000,
  "127.0.0.1",
  (err, bytes) => {
    if (err) console.error(err);

    console.log({ bytes });
  }
);
    