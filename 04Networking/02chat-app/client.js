const net = require("node:net");
const readline = require("node:readline/promises");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const port = 3008;
const hostname = "127.0.0.1";

// Clear the current terminal line
const clearLine = (dir) => {
  return new Promise((resolve) => {
    process.stdout.clearLine(dir, () => resolve());
  });
};

// Move the terminal cursor
const moveCursor = (dx, dy) => {
  return new Promise((resolve) => {
    process.stdout.moveCursor(dx, dy, () => resolve());
  });
};

// Move cursor + clear the line in one step
const clearAndMoveCursor = async (dx = 0, dy = -1, dir = 0) => {
  await moveCursor(dx, dy);
  await clearLine(dir);
};

let clientId;

// Prompt user for input and send it to server
const ask = async () => {
  try {
    const message = await rl.question("Enter a message > ");
    await clearAndMoveCursor(0, -1, 0);
    client.write(`${clientId}-message-${message}`);
  } catch (err) {
    if (err.name === "AbortError") {
      // Ctrl+C handling
      console.log("\nAborted by user.");
      rl.close();
      client.end();
      process.exit(0);
    } else {
      throw err;
    }
  }
};

// Connect to TCP server and start asking for input
const client = net.createConnection({ host: hostname, port }, ask);

client.on("data", async (data) => {
  console.log();
  await clearAndMoveCursor(0, -1, 0);

  const parsedData = data.toString("utf-8");

  if (parsedData.startsWith("id")) {
    clientId = parsedData.substring(3); // Extract client ID
    console.log(`Your client ID is ${clientId}!\n`);
  } else {
    console.log(parsedData); // Show message from server
  }

  await ask();
});

client.on("end", () => {
  console.log("Connection was closed");
});
