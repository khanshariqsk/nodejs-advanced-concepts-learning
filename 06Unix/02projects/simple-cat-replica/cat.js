const { stdin, stdout, argv, exit } = require("node:process");
const fs = require("node:fs");
const { pipeline } = require("node:stream");

const filePath = argv[2];

if (filePath) {
  pipeline(fs.createReadStream(filePath), stdout, (err) => {
    if (err) {
      console.log(err.message);
    }
    stdout.write("\n");
    exit(0);
  });
}

stdin.on("data", (data) => {
  stdout.write(data);
});
