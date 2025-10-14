function start() {
  console.log("1- start");
}

function end() {
  console.log("1- end");
}

start();

process.nextTick(() => {
  console.log("2- first nextTick callback");
});

setTimeout(() => {
  console.log("3- setTimeout callback"); // could happen before or after setImmediate
}, 0);

setImmediate(() => {
  console.log("3- setImmediate callback");
});

process.nextTick(() => {
  console.log("2- second nextTick callback");
});

Promise.resolve().then(() => {
  console.log("2- promise callback");
});

process.nextTick(() => {
  console.log("2- third nextTick callback");
});

end();
