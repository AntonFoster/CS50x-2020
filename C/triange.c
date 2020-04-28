#include <stdio.h>
#include <string.h>

int valid_triange(int a, int b, int c);


// User Input ./name v1 v2 (argc = 3 number of args 0 = program, argv is an array argv[argc] last = argv[argc-1])
// 

int main(int argc, char *argv[])
{
    printf("Arags %i \n", argc);
    char s[] = {'A', 'n', 't', 'o', 'n', '\0'};
    printf("String %s \n", s);
    for (int a = 0, n = strlen(s); a < n; a++ )
    {
        printf("%c", s[a]);
    }
    printf("\n");

  //string to integer -  
  for (int i = 0; i <= argc - 1; i++){
      printf("Input %i = %s \n", i, argv[i]);
      printf("can traingle %s\n", (valid_triange(i ,3,4))?"True":"False");


  }

  //printf("\n\nYour traingle %s\n", (valid_triange((int) argv[1],(int) argv[2], (int) argv[3]))?"True":"False");
}

int valid_triange(int a, int b, int c)
{
    if (a <= 0 || b <= 0 || c <= 0 ){
        return 0;
    }

    if ((a + b <= c) || (b + c <= a) || (a + c <= b))
    {
        return 0;
    }
    return 1;   
}