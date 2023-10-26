export const cleanFloat = (input: string) => {
    // Check if the input contains a comma and remove it
    input = input.replace(/,/g, '');

    // Regular expression to match and clean the float format with optional trailing zeros and an optional decimal point
    const regex = /^0*(\d+)\.?(\d*?)0*$/;

    // Check if the input matches the regex pattern
    const match = input.match(regex);

    // If there's a match, return the cleaned float, otherwise return "0"
    if (match) {
        const integerPart = match[1];
        const decimalPart = match[2] || '';
        return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    } else {
        throw new Error('Invalid float to clean');
    }
}