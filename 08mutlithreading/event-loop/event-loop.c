/** Use this code to try to get a better idea about how the event loop in Node.js works. */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

// 0: initial state
// 1: scheduled
// 2: done executing
int async_task_state = 0;
// You can imagine that we'll have more states if we set up more async tasks...

// Our async task
void* async_task(void* arg) {
  int seconds = *(int*)arg;
  sleep(seconds);
  printf("Async task completed.\n");

  async_task_state = 2; // specify that the task is now done
  return NULL;
}

void async_task_callback() {
  printf("Executing callback in the main thread after async task completion...\n");
}

int main() {
  pthread_t thread;
  int duration = 30; // Duration for the async task (in seconds)

  async_task_state = 1; // specify that the task has been scheduled
  // Create a new thread that runs the async_task function
  pthread_create(&thread, NULL, async_task, &duration);


  printf("Main thread is free to do other work...\n");


  // This is a simplified event loop, emulated for educational purposes.
  // It continuously polls the task state (or states once we add in more) and triggers the callback once the async operation completes.
  while (async_task_state != 0) {
    if (async_task_state == 2) {
      async_task_callback();
      async_task_state = 0;
    }
  }


  // Optionally wait for the thread to finish before exiting the app
  pthread_join(thread, NULL);
  return 0;
}
