// https://symbl.cc/

const { Buffer, constants } = require("buffer");

console.log(constants.MAX_LENGTH);
console.log(Buffer.poolSize);

/*
const memoryContainer = Buffer.alloc(4); // 4 bytes (32 bits)

memoryContainer[0] = 0xf4;
memoryContainer[1] = 0x34;
memoryContainer[2] = 0x00;
memoryContainer[3] = 0xff;

console.log(memoryContainer);
console.log(memoryContainer[0]);
console.log(memoryContainer[1]);
console.log(memoryContainer[2]);
console.log(memoryContainer[3]);

console.log(memoryContainer.toString("hex"));
*/

/*
const buff = Buffer.from([0x48, 0x69, 0x21]);
console.log(buff.toString("utf-8"));
*/

/*
const buff = Buffer.from("486921", "hex");
console.log(buff.toString("utf-8"));
*/

/*
const buff = Buffer.from("Hi!", "utf-8");
console.log(buff);
*/

const buff = Buffer.from("E0A49B", "hex");
console.log(buff.toString("utf-8"));
