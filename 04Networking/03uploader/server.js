const net = require("node:net");
const fs = require("node:fs/promises");
const path = require("node:path");

const port = 5500;
const hostName = "::1"; // "::1" is IPv6 loopback (like 127.0.0.1 for IPv4)

// Create a TCP server
const server = net.createServer(async (socket) => {
  console.log("A New Connection has been made!");

  let fileHandler, fileStream;
  let isFileHandlerCreated = false; // Track if the file stream is initialized

  // Handle incoming data from client
  socket.on("data", async (data) => {
    // Step 1: Expect the first message to contain filename info
    if (!isFileHandlerCreated) {
      socket.pause(); // Pause reading to prevent buffer overflow while processing header

      const parsedString = data.toString("utf-8");
      const txtSeperator = "fileName:";

      // If header is invalid -> send error and close connection
      if (!parsedString.includes(txtSeperator)) {
        socket.write("ERROR: Invalid header. Expected 'fileName:'\n", () => {
          socket.end(); // Close connection after error
        });
        return;
      }

      // Extract filename from header
      const fileName = parsedString.substring(
        parsedString.indexOf(txtSeperator) + txtSeperator.length
      );

      // Define storage path where file will be saved
      const storagePath = path.join("storage", fileName);

      // Open file for writing
      fileHandler = await fs.open(storagePath, "w");
      fileStream = fileHandler.createWriteStream();

      isFileHandlerCreated = true;
      socket.resume(); // Resume receiving file chunks
    }
    // Step 2: If handler is ready, write incoming data into the file
    else {
      const canWrite = fileStream.write(data);

      // If internal buffer is full, pause reading until "drain" event
      if (!canWrite) {
        socket.pause();
        fileStream.once("drain", () => {
          socket.resume();
        });
      }
    }
  });

  // When client finishes sending data
  socket.on("end", async () => {
    if (fileStream) fileStream.end(); // Ensure file stream is closed properly
    if (fileHandler) await fileHandler.close(); // Close file descriptor
  });

  // Handle socket errors (e.g., client disconnects unexpectedly)
  socket.on("error", async (err) => {
    console.error("Socket error:", err);
    if (fileStream) fileStream.destroy(); // Destroy file stream to prevent corruption
    if (fileHandler) await fileHandler.close();
  });
});

// Start listening for incoming connections
server.listen(port, hostName, () => {
  console.log("Opened server on", server.address());
});
