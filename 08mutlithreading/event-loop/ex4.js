// Without setImmediate or process.nextTick, we'll get call stack size exceeded
function bar() {
  console.log("bar");

  return bar();

  // return process.nextTick(bar);

  // return setImmediate(() => {
  //   bar();
  // });
}

bar();

/**
 * Use this command line option to see your stack size specified in kilobytes (with manual searching):
 * > node --v8-options
 *
 * Use this command to filter and find the stack size easier:
 * > node --v8-options | grep stack-size
 *
 * Here's how you can set your stack size (in KB):
 * node --stack-size=1000 ex4.js
 */

/** You can run this code to see how many functions you can add to your stack before running out of stack memory:  */
// function recurse(count) {
//   console.log(count);

//   // Adding more objects increases the memory used by each function,
//   // which reduces the maximum number of function calls before the stack overflows.

//   recurse(count + 1);
// }

// recurse(1);
