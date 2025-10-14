/** Use this code to see that async work without another hardware component or thread is impossible. */

#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
#include <stdlib.h>

typedef struct {
  int milliseconds;
  void (*callback)();
} ThreadArgs;

void* calc_sleep(void* arg) {
  ThreadArgs* args = (ThreadArgs*)arg;
  // Sleep for the specified time in milliseconds
  usleep(args->milliseconds * 1000);  // convert milliseconds to microseconds
  args->callback(); // call the callback function
  free(args);
  return NULL;
}

void setTimeout(int milliseconds, void (*callback)()) {
  pthread_t thread;
  ThreadArgs* args = malloc(sizeof(ThreadArgs));  // Allocate memory for arguments

  args->milliseconds = milliseconds;
  args->callback = callback;

  pthread_create(&thread, NULL, calc_sleep, args);
  pthread_detach(thread);  // Detach thread to avoid needing to join
}

void func() {
  // Doing work...
  printf("Timeout reached! Executing callback.\n");
}

int main() {
  printf("Starting setTimeout...\n");
  setTimeout(5000, func);  // Execute func after 5 seconds asynchronously 
  printf("Finished!\n");  // This will print immediately

  // Prevent main thread from exiting immediately (only for demonstration)
  sleep(100);  // Normally you'd have your main event loop or other work here
  return 0;
}
