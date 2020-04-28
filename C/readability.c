#include <cs50.h>
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

const char ENDOFSENTENCE[] = {'!', '.', '?'};
const float CHARCAL = 0.0588;
const float SENTCAL = 0.296;
const float NEGVAL = 15.8;

bool process_text(string txt);
string getInput(void);
bool endOfSentence(char letter);
int calc_score(int scores[]);
void SetGrade(int rv);

/**
 * Main Loop
 */
int main(int argc, string argv[])
{
    string txt;

    // Check if text was passed in on the command line
    if (argc > 1)
    {
        txt = argv[1];
    }
    else
    {
        txt = getInput();
    }
    bool x = process_text(txt);
}

/**
 * Parse Input from the user
 */
string getInput(void)
{
    string str;
    do
    {
        printf("Enter paragraph text to process? \n");
        str = get_string("Paragraph: ");
    }
    while (str == NULL);
    return str;
}

/**
 * Process the Text
 * @param string txt - Text tp parse and grade
 * @return Bool
 */ 
bool process_text(string txt)
{
    // Statistics array [characters, words, sentences]
    int stats[] = {0, 0, 0};

    int n = strlen(txt);
    bool skipSpace = false;

    // Loop through the characters
    for (int i = 0; i < n; i++)
    {
        // Get Characters
        if (isalnum(txt[i]))
        {
            stats[0]++;
        }
        // get words
        if (isspace(txt[i]))
        {
            if (skipSpace)
            {
                skipSpace = false;
            }
            else
            {
                stats[1]++;
            }
        }
        // check for end of sentence
        if (endOfSentence(txt[i]))
        {
            stats[1]++;
            stats[2]++;
            // If the end of a sentence mark the next space to be skipped
            skipSpace = true;
        }
    }
    // printf("Chatacters: %i, Words: %i, Sentences: %i \n", stats[0], stats[1], stats[2]);
    int grade = calc_score(stats);
    // printf("Score : %i\n", grade);
    SetGrade(grade);
    return true;
}

/**
 * Check for an end of sentence (.?!)
 * @param char letter - char to check
 * @return bool
 */
bool endOfSentence(char letter)
{
    int n = 3; 
    // loop throgh each of the defined end of sentence identifiers
    for (int i = 0; i < n ; i++)
    {
        if (letter == ENDOFSENTENCE[i])
        {
            return true;
        }
    }
    return false;
}

/**
 * Calculate the final score based on the stats
 * @param int[] scores - Stats 
 * @return int - Grade
 */
int calc_score(int scores[])
{
    // if the number of words is 0 return 0 as you can not divide by 0
    if (scores[1] < 1)
    {
        return 0;
    }
    // Calculate l
    float l = ((float) scores[0] / (float) scores[1]);
    l = (l * 100);
    // Calculate s
    float s = ((float) scores[2] / (float) scores[1]);
    s = (s * 100);
    // calculate the grade (as a float)
    float x = (((CHARCAL * l) - (SENTCAL * s)) - NEGVAL);
    // Round the result and parse as an int
    int reada = (int) round(x);

    return reada;
}

/**
 * Print the text for the grade
 * @param int rv - raw value of the grade
 */
void SetGrade(int rv)
{
    // if less than 1
    if (rv < 1)
    {
        printf("Before Grade 1\n");
    }
    // More than 16
    else if (rv > 16)
    {
        printf("Grade 16+\n");
    }
    // All others
    else
    {
        printf("Grade %i\n", rv);
    }
}