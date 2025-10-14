// Import data shared between threads (from main thread)
const { workerData, threadId } = require("worker_threads");

// Create typed arrays pointing to shared memory
const numberBuffer = new Int32Array(workerData.numberBuffer); // Shared counter
const seal = new Int32Array(workerData.seal);                  // Acts as a lock (mutex)

// -----------------------------
// 🔒 Lock Implementation
// -----------------------------
function lock(seal) {
  // Try to acquire the lock:
  // Atomics.compareExchange(seal, index, expectedValue, newValue)
  // Here → if seal[0] === 0 (unlocked), set it to 1 (locked) and proceed.
  // If it's already 1, keep waiting.
  while (Atomics.compareExchange(seal, 0, 0, 1) === 1) {
    // Lock is taken → put this thread to sleep until someone calls Atomics.notify()
    Atomics.wait(seal, 0, 1);
  }
  // When this loop exits, we have successfully acquired the lock.
}

// -----------------------------
// 🔓 Unlock Implementation
// -----------------------------
function unlock(seal) {
  // Mark the lock as free again by setting seal[0] = 0
  Atomics.store(seal, 0, 0);

  // Wake up one waiting thread (if any) so it can attempt to acquire the lock
  Atomics.notify(seal, 0, 1);
}

// -----------------------------
// 🚀 Critical Section
// -----------------------------
for (let i = 0; i < 5_000_000; i++) {
  // Acquire lock before modifying the shared data
  lock(seal);

  // ---- Critical Section ----
  // Only one thread at a time can safely execute this part.
  numberBuffer[0] = numberBuffer[0] + 1;
  // --------------------------

  // Release the lock so another thread can continue
  unlock(seal);
}

// 🧠 Summary:
// - Each thread repeats 5 million increments.
// - `lock()` ensures mutual exclusion using atomic operations.
// - `unlock()` safely releases and notifies waiting threads.
// - This avoids race conditions while efficiently managing CPU (no busy-waiting).
