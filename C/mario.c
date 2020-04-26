#include <cs50.h>
#include <stdio.h>

int getHeight(void);
void buildPyramid(int h);
void BuildSection(int w, string d);

int main(void)
{
   int height = getHeight();
   buildPyramid(height); 
}

/*
* Get the hight from the user
* between 1 and 8
*/
int getHeight(void)
{
    int i;
    do 
    {
        // get the user input
        i = get_int("How high must the pyramid be? \n");
    } 
    while (i < 1 || i > 8);
    return i;
}

/*
* Build the pyramid
*/
void buildPyramid(int h)
{
    string gap = "  ";  // The gap
    string spc = " ";   // used for the spaces in front
    string hsh = "#";   // The hashes

    int w = 0; // Variable used to store the number of iterations

    // loop through the height 
    for (int i = 0; i < h; i++)
    {
        w++;  
        int fgap = (h - w);
        BuildSection(fgap, spc);    // display the spaces in the front
        BuildSection(w, hsh);       // display first hashes
        printf("%s", gap);          // display the gap
        BuildSection(w, hsh);       // display the second section
        printf("\n");               // New line
    }
}

/*
* Build sections
*/
void BuildSection(int w, string d)
{
    // loop for w and print d
    for (int i = 0; i < w; i++)
    {
        printf("%s", d);
    }
}