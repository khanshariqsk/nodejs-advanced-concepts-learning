const zlib = require("zlib");
const fs = require("fs");

const src = fs.createReadStream("");
const dest = fs.createWriteStream("");

src.pipe(zlib.createInflate()).pipe(dest);

// zlib.createGunzip();
