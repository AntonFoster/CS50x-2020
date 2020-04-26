#include <cs50.h>
#include <stdio.h>
#include <string.h>

long getCardDigits(void);
void validateCard(long cardno);
int getSum(int value);
int isValid(int score);
string cardType(string cardno);

/*
* Main Loop
*/
int main(void)
{
    long cardno = get_long("Enter your card number: \n");
    validateCard(cardno);
}

/**
 * Get User card no
 */
long getCardDigits(void)
{
    long i;
    do
    {
        // get the user input
        i = get_long("Enter your card number: \n");
    } 
    while (i < 1 || i > 8);

    return i;
}

/**
 * Validate users card
 * @param long cardno - Users card number
 */
void validateCard(long cardno)
{
    char cardchar[16]; // Variable to hold the card number

    int cardsum = 0; // Vatiable to hold tha calculated sum

    sprintf(cardchar, "%li", cardno); // Convert the long to an array of chars

    long length = strlen(cardchar); // get the length of the card number

    int p = 1; // Counter for determining odss or evens

     // Loop backwards through the card digits
    for (int i = length - 1; i > -1; i--)
    {                                  
        int ia = (int)cardchar[i] - 48; // get the integer value of the digit
        int prod = ia * 2;              // get the produc if the digit x 2
        if (p % 2 == 0)
        {
            cardsum += getSum(prod);
        }
        else
        {
            cardsum += getSum(ia);
        }
        p++;
    }
    // Validate the card sum and check the card length
    if (isValid(cardsum) && (length >= 13 && length <= 16))
    {
        // Identify the card
        printf("%s\n", cardType(cardchar));
    }
    else
    {
        printf("INVALID\n");
    }
}

/**
 * Adds multi digit results
 * @param int value - Value to calculate
 * @return int - Sum of the parts
 */
int getSum(int value)
{
    char sect[4];
    int sumv = 0;
    sprintf(sect, "%i", value);
    int length = strlen(sect);
    for (int i = 0; i < length; i++)
    {
        int ia = (int)sect[i] - 48;
        sumv += ia;
    }

    return sumv;
}

/**
 * Validated the card score (last digit must be a 0)
 * @param int score - Score to validate
 * @return int - (1/0) true or false
 */
int isValid(int score)
{
    char sect[4];
    int sumv = 0;
    sprintf(sect, "%i", score);
    int length = strlen(sect);
    if ((int)sect[length - 1] == 48)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

/**
 * Try and identify the card
 * @param string cardno - card number
 * @return string - Name of card vendor or UNKNOWN
 */
string cardType(string cardno)
{
    //printf("CARD NO %s", cardno);
    int d0 = (int)cardno[0] - 48;
    int d1 = (int)cardno[1] - 48;
    if (d0 == 3 && (d1 == 4 || d1 == 7))
    {
        return "AMEX";
    }

    if (d0 == 5 && (d1 >= 1 && d1 <= 5))
    {
        return "MASTERCARD";
    }

    if (d0 == 4)
    {
        return "VISA";
    }

    return "UNKNOWN";
}
