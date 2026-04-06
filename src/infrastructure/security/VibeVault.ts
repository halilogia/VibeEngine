

const VAULT_SALT = 'vibe_sovereign_elite_2026';

export const VibeVault = {
    
    seal: (value: string): string => {
        if (!value) return '';
        
        const shifted = value.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ VAULT_SALT.charCodeAt(i % VAULT_SALT.length))
        ).join('');
        return btoa(shifted);
    },

    unseal: (sealed: string): string => {
        if (!sealed) return '';
        try {
            const decoded = atob(sealed);
            return decoded.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ VAULT_SALT.charCodeAt(i % VAULT_SALT.length))
            ).join('');
        } catch (e) {
            console.error('VibeVault: Neural Link Decryption Failed! 🛡️', e);
            return '';
        }
    },

    saveSecret: (key: string, secret: string) => {
        const sealed = VibeVault.seal(secret);
        localStorage.setItem(`vault_${key}`, sealed);
    },

    getSecret: (key: string): string => {
        const sealed = localStorage.getItem(`vault_${key}`);
        if (!sealed) return '';
        return VibeVault.unseal(sealed);
    }
};
