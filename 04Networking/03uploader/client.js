const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs/promises");

const port = 5500;
const hostName = "::1"; // "::1" = IPv6 loopback (use "127.0.0.1" for IPv4)

// Create a TCP client connection
const client = net.createConnection({ port, host: hostName }, async () => {
  try {
    // Step 1: Get file path from command line argument
    const filePath = process.argv[2];
    if (!filePath) {
      console.error("Usage: node client.js <filePath>");
      client.end();
      return;
    }

    const fileName = path.basename(filePath); // Extract just the filename
    const fileHandler = await fs.open(filePath, "r");
    const fileSize = (await fileHandler.stat()).size; // Get total size of file

    // Step 2: Send filename header to server
    client.write(`fileName:${fileName}`);

    // Step 3: Create a read stream for the file
    const fileStream = fileHandler.createReadStream();
    let totalBytesWritten = 0; // Track upload progress
    let lastUpdateTime = Date.now();

    // Handle file chunks
    fileStream.on("data", (data) => {
      const canWrite = client.write(data); // Send chunk to server
      totalBytesWritten += data.length;

      // Update progress every ~100ms (avoid too many console updates)
      const now = Date.now();
      if (now - lastUpdateTime >= 100) {
        const percent = ((totalBytesWritten / fileSize) * 100).toFixed(2);
        process.stdout.write(`Uploading ${percent}%\r`);
        lastUpdateTime = now;
      }

      // Backpressure handling → if kernel buffer is full, pause
      if (!canWrite) {
        fileStream.pause();
      }
    });

    // When the TCP buffer drains, resume reading
    client.on("drain", () => {
      fileStream.resume();
    });

    // When the file has been fully read and sent
    fileStream.on("end", async () => {
      process.stdout.write(`✅ Fully Uploaded (100%)\n`);
      client.end(); // Tell server we’re done
      await fileHandler.close(); // Close file descriptor
    });

    // Step 4: Handle server responses (success or error)
    client.on("data", async (data) => {
      const msg = data.toString("utf-8");

      if (msg.startsWith("ERROR:")) {
        // Server rejected upload (invalid header, etc.)
        console.error("Server error:", msg);
        client.end();
        await fileHandler.close();
      } else {
        console.log("Server says:", msg);
      }
    });

    // Step 5: Handle connection close & errors
    client.on("end", () => {
      // console.log("Connection closed by server");
    });

    client.on("error", (err) => {
      console.error("Socket error:", err);
    });
  } catch (error) {
    console.log("Client error:", error.message);
    process.exit(0);
  }
});
