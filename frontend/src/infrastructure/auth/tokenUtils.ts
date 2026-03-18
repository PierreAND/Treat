
const decodeJwtPayload = (token: string): Record<string, any> | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string, marginSeconds: number = 60): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - marginSeconds < nowInSeconds;
};