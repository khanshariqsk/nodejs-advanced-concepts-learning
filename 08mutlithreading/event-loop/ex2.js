// Make sure to comment the portions you don't want to run

// ----- ABCD or ABDC ----- //
setTimeout(() => {
  console.log("A");
}, 0);

setTimeout(() => {
  setImmediate(() => {
    console.log("D");
  });

  process.nextTick(() => {
    console.log("B");
  });
}, 0);

setTimeout(() => {
  console.log("C");
}, 0);

// // ----- AB or BA ----- //
// setTimeout(() => {
//   console.log("A");
// }, 0);

// setImmediate(() => {
//   console.log("B");
// });

// // ----- AB ----- //
// const fs = require("node:fs");

// fs.readFile(__filename, () => {
//   setTimeout(() => {
//     console.log("B");
//   }, 0);

//   setImmediate(() => {
//     console.log("A");
//   });
// });

// /*
//  Another example where you can see the phases of the event loop and
//  also the next tick queue stage in action. Notice that the next ticks
//  always happen before the event loop continues. And the setImmediate 
//  one is always right after the next ticks. If the code were not inside
//  of an fs callback, the order of the setImmediate would've been different.
// */
// const fs = require("node:fs");

// fs.readFile(__filename, () => {
//   console.log("File read");

//   for (let i = 0; i < 10000; i++) {
//     setTimeout(() => {
//       console.log(`Iteration ${i}`);
//     }, 0);

//     if (i % 500 === 0) {
//       process.nextTick(() => {
//         console.log(`NextTick! Iteration ${i}`);
//       });
//     }
//   }

//   setImmediate(() => {
//     console.log(`HEY!`);
//   });
// });
