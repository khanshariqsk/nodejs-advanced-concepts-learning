const { exec } = require("child_process");

const command = "node app.js";
const expectedOutput = "A\nB";

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${stderr}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

let badOutput = false;

async function checkOutput() {
  for (let i = 0; i < 10000; i++) {
    try {
      const output = await runCommand(command);
      // Stop the loop if an unexpected output is found, and log the output
      if (output !== expectedOutput) {
        badOutput = true;
        console.log(`Unexpected output on iteration ${i}:`);
        console.log(output);
      }
    } catch (err) {
      console.error(err);
      break;
    }
  }

  if (!badOutput) console.log("Got the expected output in all iterations.");
}

checkOutput();
