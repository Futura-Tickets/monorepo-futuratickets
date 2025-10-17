export function parseAddress(address: `0x${string}` | string): string {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`;
}

export const copyToClipboard = (address: string): void => {
    navigator.clipboard.writeText(address); 
};

export const calculateDaysBetweenDates = (startDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const chartStartDate = startDate.setHours(0, 0, 0, 0);
    const chartEndDate = endDate.setHours(0, 0, 0, 0);
    return Math.round(Math.abs((chartStartDate - chartEndDate) / oneDay));
};

export const calculateHoursBetweenDates = (startDate: Date, endDate: Date): number => {
    const oneHour = 60 * 60 * 1000;
    const chartStartDate = new Date(startDate).getTime();
    const chartEndDate = new Date(endDate).getTime();
    return Math.round(Math.abs((chartStartDate - chartEndDate) / oneHour));
};

export const formatTwoDigits = (digit: number): string => {
    return digit < 10 ? '0' + digit.toString() : digit.toString();
};

export const cleanStringForURL = (input: string): string => {
    return input.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');                   
}