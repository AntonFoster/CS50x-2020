#include <stdio.h>
#include <string.h>

void build(int h, int w, int ofs);

int main(void)
{
    build(20, 20, 10);
}

void build(int h, int w, int ofs)
{
    printf("Height : %i\n", h);
    printf("Width : %i\n", w);
    printf("Offset: %i\n", ofs);
    char offset[ofs];
    char spc = '-';
    char hs = '#';

    for (int i = 0; i < ofs; i++)
    {
        strncat(offset, &spc, 1);
    }
    printf("Appended String: %s\n", offset);
    int ww = 0;
    for (int i = 0; i < h; i++)
    {
        // printf("%s" , offset);
        // do {
        //     printf("%c" , hs);
        //     ww--;
        // } while(ww < w);
        
            
        
        for (int y = 0; y < ww; y++)
        {
            printf("%c" , hs);
        }
        ww++;
        printf("\n");
    }
}