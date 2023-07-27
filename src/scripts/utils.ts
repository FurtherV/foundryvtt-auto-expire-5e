export function recordToArray<K extends number, T>(record: Record<K, T>): T[] {
    return Array.from(Object.values(record));
}

export function arrayToRecord<T>(array: T[]): Record<number, T> {
    const record: Record<number, T> = {};
    for (let i = 0; i < array.length; i++) {
        record[i] = array[i];
    }
    return record;
}
