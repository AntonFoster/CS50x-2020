#include <cs50.h>
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <math.h>


string getInput(void);
bool ValidateKey(string key);
bool checkKeyStructure(string key);
void BuildCipher(string key, char (*cipherblock)[52]);
void printCipher(char (*cipherblock)[52]);
void Cipher(string intext, char (*cipherblock)[52]);
char getCipherLetter(char letter, char (*cipherblock)[52]);

/**
 * Main Loop
 */
int main(int argc, string argv[])
{
    string key;

    // Check if text was passed in on the command line
    // printf("Argsc %i\n", argc);
    if (argc == 2)
    {
        key = argv[1];
        bool keycheck = ValidateKey(key);
        if (!keycheck)
        {
            printf("Key is invalid\n");
            return 1;
        }
        char cipherblock[52][52];
        BuildCipher(key, cipherblock);
        // Print for Debug purposes
        // printCipher(cipherblock);
        string intext = getInput();
        //get_string("plaintext: ");
        Cipher(intext, cipherblock);
        return 0;
    }
    else
    {
        printf("Usage: ./substitution key\n");
        return 1;
    }
    return 0;
}

/**
 * Validates the key
 * @param string key - Substitution key
 * @returns bool
 */
bool ValidateKey(string key)
{
    if (strlen(key) != 26)
    {
        printf("Key must contain 26 characters.\n");
        return false;
    }
    return checkKeyStructure(key);
}

/**
 * Validates key against duplicates, numbers etc
 * @param string key - user provided key from command line
 */
bool checkKeyStructure(string key)
{
    char cblock[52];
    int cnt[52];
    int al = 0;
    for (char ch = 'A' ; ch <= 'z' ; ch == 'Z' ? ch = 'a' : ++ch)
    {
        cblock[al] = ch;
        cnt[al] = 0;
        al++;
    }

    // Check for non alph characters and duplicate letters
    for (int i = 0; i < 26 ; i++)
    {
        // check that the characters are all alpha
        if (!isalpha(key[i]))
        {
            printf("Error not an Aphha character %c\n", key[i]);
            return false;
        }
        // check for duplicates
        for (int j = 0; j < 52; j++)
        {
            if (cblock[j] == key[i])
            {
                cnt[j]++;
                if (cnt[j] > 1)
                {
                    printf("Duplicate Letter %c\n", key[i]);
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Parse Input from the user
 */
string getInput(void)
{
    string str;
    do
    {
        str = get_string("plaintext: ");
    }
    while (str == NULL);
    return str;
}

/**
 * Build the cipher block based on the key provided
 * @param string key - Key provided on the command line
 * @param char[][] cipherblock - Cipher block
 */
void BuildCipher(string key, char (*cipherblock)[52])
{
    // Uppercase char holder
    char uckey;
    // Lowercase char holder
    char lckey;
    // variable to for lowecase pointers
    int al = 0;

    // fill cipherblock [0] with the upper and lower case alphabet
    for (char ch = 'A' ; ch <= 'z' ; ch == 'Z' ? ch = 'a' : ++ch)
    {
        cipherblock[al][0] = ch;
        al++;
    }

    // Now add the uppercase and lowwercase substitution letters
    for (int i = 0; i < 26; i++)
    {
        // Init Lower case pointer
        al = i + 26;

        // Lowecase key value
        if ((int) key[i] >= 97 && (int) key[i] <= 122)
        {
            lckey = key[i];
            uckey = key[i] - 32;
        }
        // Upper case key value
        else
        {
            uckey = key[i];
            lckey = key[i] + 32;
        }
        cipherblock[al][1] = lckey;
        cipherblock[i][1] = uckey;
    }
}

/**
 * This is used purley for debuging
 * @param char[][] cipherblock - Cipher block
 */
void printCipher(char (*cipherblock)[52])
{
    for (int i = 0; i < 52; i++)
    {
        printf("Alphabet %c is substituted with %c \n", cipherblock[i][0], cipherblock[i][1]);
    }
}

/**
 * Create the cipherd eqivelent of the input text
 * @param string intext - User provided input text
 * @param char[][] cipherblock - Cipher block
 */
void Cipher(string intext, char (*cipherblock)[52])
{
    int n = strlen(intext);
    // define the holder for the new text
    char encstr[n + 1];

    // loop through the input text sustituting characters wgere requred
    for (int i = 0; intext[i] != '\0'; i++)
    {
        encstr[i] = getCipherLetter(intext[i], cipherblock);
    }
    // Add the end of string
    encstr[n] = '\0';

    // print the new cipher text
    printf("ciphertext: %s\n", encstr);
}

/**
 * Substitute the character using the cipherblock and return the
 * new character of in the case that it is not a alpha character
 * return the original character.
 * @param char letter - the letter to encrypt
 * @param char[][] cipherblock - Cipher block
 * @returns char - Result
 */
char getCipherLetter(char letter, char (*cipherblock)[52])
{
    for (int i = 0; i < 52; i++)
    {
        if (cipherblock[i][0] == letter)
        {
            return cipherblock[i][1];
        }
    }
    return letter;
}