/*
0000   50 4f 53 54 20 2f 63 72 65 61 74 65 2d 70 6f 73   POST /create-pos
0010   74 20 48 54 54 50 2f 31 2e 31 0d 0a 43 6f 6e 74   t HTTP/1.1..Cont
0020   65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63   ent-Type: applic
0030   61 74 69 6f 6e 2f 6a 73 6f 6e 0d 0a 43 6f 6e 74   ation/json..Cont
0040   65 6e 74 2d 4c 65 6e 67 74 68 3a 20 35 36 0d 0a   ent-Length: 56..
0050   48 6f 73 74 3a 20 6c 6f 63 61 6c 68 6f 73 74 3a   Host: localhost:
0060   38 30 35 30 0d 0a 43 6f 6e 6e 65 63 74 69 6f 6e   8050..Connection
0070   3a 20 6b 65 65 70 2d 61 6c 69 76 65 0d 0a 0d 0a   : keep-alive....



504f5354202f6372656174652d706f737420485454502f312e310d0a436f6e74656e742d547970653a206170706c69636174696f6e2f6a736f6e0d0a436f6e74656e742d4c656e6774683a2035360d0a486f73743a206c6f63616c686f73743a383035300d0a436f6e6e656374696f6e3a206b6565702d616c6976650d0a0d0a


0000   7b 22 74 69 74 6c 65 22 3a 22 48 65 6c 6c 6f 20   {"title":"Hello 
0010   57 6f 72 6c 64 22 2c 22 63 6f 6e 74 65 6e 74 22   World","content"
0020   3a 22 54 68 69 73 20 69 73 20 61 20 74 65 73 74   :"This is a test
0030   20 70 6f 73 74 2e 22 7d                            post."}



7b227469746c65223a2248656c6c6f20576f726c64222c22636f6e74656e74223a22546869732069732061207465737420706f73742e227d

*/

const net = require("net");
const hostname = "localhost";
const port = 8050;
const socket = net.createConnection(
  {
    host: hostname,
    port,
  },
  () => {
    const bufferHead = Buffer.from(
      "504f5354202f6372656174652d706f737420485454502f312e310d0a436f6e74656e742d547970653a206170706c69636174696f6e2f6a736f6e0d0a436f6e74656e742d4c656e6774683a2035360d0a486f73743a206c6f63616c686f73743a383035300d0a436f6e6e656374696f6e3a206b6565702d616c6976650d0a0d0a",
      "hex"
    );

    const bufferBody = Buffer.from(
      "7b227469746c65223a2248656c6c6f20576f726c64222c22636f6e74656e74223a22546869732069732061207465737420706f73742e227d",
      "hex"
    );
    const buffer = Buffer.concat([bufferHead, bufferBody]);
    socket.write(buffer);
  }
);

socket.on("data", (data) => {
  console.log("Received data from server:", data.toString("utf-8"));
});

socket.on("end", () => {
  console.log("Disconnected from server");
});
