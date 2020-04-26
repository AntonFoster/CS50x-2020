#include <stdio.h>
#include <cs50.h>

// Main entry point
int main(void)
{
    // Ask the user for a name
    string name = get_string("What is your name?\n");
    // Greet the user
    printf("hello, %s\n", name);
}