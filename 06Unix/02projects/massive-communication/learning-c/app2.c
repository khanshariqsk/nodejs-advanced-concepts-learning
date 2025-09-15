#include <stdio.h>

int main()
{
    int a = 5657;
    int *pointerA = &a;

    printf("Address: %p\n", &a);
    printf("Address pointerA: %p\n", &pointerA);

    printf("Address: %d\n", *(&a));
    printf("Address pointerA: %p\n", *(&pointerA));
    printf("Address pointerA: %d\n", *(*(&pointerA)));
}