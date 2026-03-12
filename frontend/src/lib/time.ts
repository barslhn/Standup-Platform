export function timeToMinutes(timeValue: string): number {
    if (!timeValue) return 0;
    const [hours, minutes] = timeValue.split(":").map(Number);
    return hours * 60 + (minutes || 0);
}
