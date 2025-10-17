export const formatTwoDigits = (digit: number): string => {
    return digit < 10 ? '0' + digit.toString() : digit.toString();
};