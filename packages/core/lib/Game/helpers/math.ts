export function getRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}
