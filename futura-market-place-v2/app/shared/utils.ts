export function formatTime(time: Date): string {
    const date = new Date(time);
    return (date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0'));
}