/** Use this code to try to understand the nature of an async operation better. */

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

// Our async task
void *async_task(void *arg)
{
  int seconds = *(int *)arg;
  sleep(seconds);
  printf("Async task completed.\n");
  return NULL;
}

int main()
{
  pthread_t thread;
  int duration = 3; // Duration for the async task (in seconds)
  // Create a new thread that runs the async_task function
  pthread_create(&thread, NULL, async_task, &duration);

  printf("Main thread is free to do other work...\n");

  // Optionally wait for the thread to finish before exiting the app
  pthread_join(thread, NULL);
  return 0;
}
