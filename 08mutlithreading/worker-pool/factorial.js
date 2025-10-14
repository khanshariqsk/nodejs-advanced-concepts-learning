function calculateFactorial(n) {
  let result = 1n;

  for (let i = 2n; i <= n; i++) {
    result = result * i;
  }

  return result;
}

module.exports = calculateFactorial;
