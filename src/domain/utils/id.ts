

export const vibeId = (prefix: string = 'vibe', length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
};

export const vibeNumericId = (): number => {
    return Math.floor(performance.now() * 1000) + Math.floor(Math.random() * 1000);
};
