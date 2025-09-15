#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Function to format a number string by adding a "begin" symbol
// and inserting "divider" every three digits from the right.
char *formatNumber(char *input, char begin, char divider)
{
    int length = strlen(input);

    // Calculate the maximum size needed:
    // digits + separators + begin sign + null terminator
    int formattedLength = length + length / 3 + 2;

    // Allocate memory for the formatted number string
    char *formattedNumber = (char *)malloc(formattedLength);

    int j = 0;                     // index for formattedNumber
    int commaCount = length % 3;   // determines where the first divider should go

    // Add the "begin" character (like currency symbol) at the start
    formattedNumber[0] = begin;
    j++;

    // Copy digits from input and insert dividers where needed
    for (int i = 0; i < length; i++)
    {
        formattedNumber[j] = input[i];
        j++;

        // Place a divider at the correct positions
        if (commaCount > 0 && i < length - 1 && (i + 1) % 3 == commaCount)
        {
            formattedNumber[j++] = divider;
        }
        else if (commaCount == 0 && i < length - 1 && (i + 1) % 3 == 0)
        {
            formattedNumber[j++] = divider;
        }
    }

    // Null-terminate the string
    formattedNumber[j] = '\0';

    return formattedNumber; // Caller must free this memory
}

int main(int argc, char *argv[])
{
    // argv[1] -> output file path
    // argv[2] -> begin character (currency sign)
    // argv[3] -> divider character (like ',')
    char *filePath = argv[1];

    // Open file for writing
    FILE *outputFile = fopen(filePath, "w");

    int c = fgetc(stdin); // read first char from stdin

    // Buffer to accumulate digits for one number
    char *number = (char *)malloc(10 * sizeof(char));
    int index = 0; // position in buffer

    while (c != EOF)
    {
        if (c != ' ')
        {
            // Store digit in buffer
            number[index] = c;
            index++;
        }

        // If space is encountered, process the collected number
        if (c == ' ')
        {
            if (index > 0)
            {
                number[index] = '\0'; // terminate the number string

                // Format the number with currency and divider
                char *formattedNumber = formatNumber(number, argv[2][0], argv[3][0]);

                // Write formatted number to file
                fprintf(outputFile, " %s ", formattedNumber);

                free(formattedNumber); // free memory returned by formatNumber

                index = 0; // reset buffer index for next number
            }
        }

        c = fgetc(stdin); // read next character
    }

    // Process the last number if no space follows it
    if (index > 0)
    {
        number[index] = '\0';

        char *formattedNumber = formatNumber(number, argv[2][0], argv[3][0]);

        fprintf(outputFile, " %s ", formattedNumber);

        free(formattedNumber);
    }

    free(number);         // free buffer memory
    fclose(outputFile);   // close output file
    return 0;
}
