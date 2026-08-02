export function formatBusinessDate(value: string, timeZone: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

export function formatBusinessDateTime(
    value: string,
    timeZone: string,
): string {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone,
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}
