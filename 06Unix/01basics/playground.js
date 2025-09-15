const { spawn, exec } = require("node:child_process");

// const subprocess = spawn("/usr/bin/code",["/home/shariq-khan/Documents/Projects/file-sender"]);

// subprocess.stdout.on("data", (data) => {
//   console.log(data.toString("utf-8"));
// });

// console.log(process.env.MODE);
// console.log(process.cwd());
// console.log(process.env.PWD);

process.stdin.on("data", (data) => {
  process.stdout.write(data);
});

// exec('echo "shariq bhai" | tr " " "\n"', (error, stdout, stderr) => {
//   if (error) {
//     console.log(error);
//     return;
//   }

//   console.log(stdout);

//   if (stderr) {
//     console.log(stderr);
//   }
// });
