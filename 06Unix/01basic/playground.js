const { spawn, exec } = require("node:child_process");

// const subprocess = spawn("ls",["-l"]);

// subprocess.stdout.on("data", (data) => {
//   console.log(data.toString("utf-8"));
// });

exec('echo "shariq bhai" | tr " " "\n"', (error, stdout, stderr) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(stdout);

  if (stderr) {
    console.log(stderr);
  }
});
