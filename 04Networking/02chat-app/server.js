const net = require("node:net");
const server = net.createServer();

const port = 3008;
const hostname = "127.0.0.1";

// Store connected clients
const clients = [];

server.on("connection", (socket) => {
  console.log("A new connection to the server");

  const clientId = clients.length + 1;

  // Notify existing clients that a new user joined
  clients.forEach((client) => {
    client.socket.write(`User ${clientId} joined`);
  });

  // Send new client their ID
  socket.write(`id-${clientId}`);

  // Handle client disconnect
  socket.on("end", () => {
    clients.forEach((client) => {
      client.socket.write(`User ${clientId} left`);
    });
  });

  // Handle incoming messages
  socket.on("data", (data) => {
    const dataString = data.toString("utf-8");
    const seperatorTxt = "-message-";

    // Extract sender's ID
    const id = dataString.substring(0, dataString.indexOf("-"));

    // Extract actual message text
    const message = dataString.substring(
      dataString.indexOf(seperatorTxt) + seperatorTxt.length
    );

    // Broadcast message to all connected clients
    clients.forEach((client) => {
      client.socket.write(`> User ${id}: ${message}`);
    });
  });
  
  // Save the new client in the list
  clients.push({ clientId: clientId.toString(), socket });
});

// Start the TCP server
server.listen(port, hostname, () => {
  console.log("Opened server on", server.address());
});
