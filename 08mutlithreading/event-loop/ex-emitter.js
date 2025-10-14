const EventEmitter = require("node:events");

class MyEmitter extends EventEmitter {
  constructor() {
    super();

    process.nextTick(() => {
      this.emit("start");
    });
  }
}

const myEmitter = new MyEmitter();
myEmitter.on("start", () => {
  console.log("Ready to go!");
});
