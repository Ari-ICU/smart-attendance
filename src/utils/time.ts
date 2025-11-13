
// utils/time.ts
export const parseTimeToMinutes = (time?: string): number => {
    if (!time) return NaN;
    const t = time.trim().toUpperCase();
    const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return NaN;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

export const calculateWorkMinutes = (checkIn?: string, checkOut?: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = parseTimeToMinutes(checkIn);
    const end = parseTimeToMinutes(checkOut);
    if (isNaN(start) || isNaN(end)) return 0;
    let diff = end - start;
    if (diff < 0) diff += 24 * 60; // overnight shift
    return diff;
};

export const formatMinutes = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};
