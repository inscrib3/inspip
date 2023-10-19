export const truncateInMiddle = (inputString: string, maxLength: number) => {
  // Check if the input string is already shorter than the maxLength
  if (inputString.length <= maxLength) {
    return inputString;
  }

  // Calculate the length of the string to keep on each side of the truncation
  const sideLength = Math.floor((maxLength - 3) / 2); // 3 is for the ellipsis (...)

  // Create the truncated string by taking a portion from the start and end of the input string
  const truncatedString =
    inputString.substring(0, sideLength) +
    "..." +
    inputString.substring(inputString.length - sideLength);

  return truncatedString;
};
