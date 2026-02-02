/**
 * Generate a unique client/drawing ID.
 * Uses a combination of timestamp and random string for uniqueness.
 */
export function generateClientId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
}
