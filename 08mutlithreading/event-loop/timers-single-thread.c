/**
 * Use this code to see that async work without another hardware component or thread is impossible.
 * Note that the setTimeout in this file is not run asynchronously!
*/

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/time.h>

// A linked list of the setTimeouts
typedef struct TimeoutEvent {
  double trigger_time;
  void (*callback)();
  struct TimeoutEvent* next;
} TimeoutEvent;

TimeoutEvent* timeout_queue = NULL;

double get_current_time() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return tv.tv_sec + tv.tv_usec / 1e6;
}

void setTimeout(double seconds, void (*callback)()) {
  double trigger_time = get_current_time() + seconds;

  TimeoutEvent* new_event = malloc(sizeof(TimeoutEvent));
  if (new_event == NULL) {
    perror("Failed to allocate memory");
    return;
  }

  new_event->trigger_time = trigger_time;
  new_event->callback = callback;
  new_event->next = NULL;

  // Insert into the timeout queue
  if (timeout_queue == NULL) {
    timeout_queue = new_event;
  }
  else {
    TimeoutEvent* current = timeout_queue;
    while (current->next != NULL) {
      current = current->next;
    }
    current->next = new_event;
  }
}

void processTimeouts() {
  TimeoutEvent* current = timeout_queue;
  TimeoutEvent* prev = NULL;

  double current_time = get_current_time();

  while (current != NULL) {
    if (current->trigger_time <= current_time) {
      current->callback();

      // Remove the event from the queue
      if (prev == NULL) {
        timeout_queue = current->next;
        free(current);
        current = timeout_queue;
      }
      else {
        prev->next = current->next;
        free(current);
        current = prev->next;
      }
    }
    else {
      prev = current;
      current = current->next;
    }
  }
}

void myCallback1() {
  printf("Timeout reached after 12 seconds! Executing callback.\n");
}

void myCallback2() {
  printf("Timeout reached after 2 seconds! Executing callback.\n");
}

int main() {
  printf("Starting the app...\n");

  setTimeout(12.0, myCallback1);
  setTimeout(2.0, myCallback2);


  // Can we do these in a single thread asynchronously? Nope!
  fopen("file1.txt", "w");
  fopen("file2.txt", "w"); // imagine this is going to take 50 seconds to complete...


  printf("Entering event loop...\n");
  while (timeout_queue != NULL) {
    processTimeouts();
    usleep(1000);  // Sleep for 1ms to avoid busy waiting
  }

  printf("All timeouts processed. Exiting.\n");
  return 0;
}
