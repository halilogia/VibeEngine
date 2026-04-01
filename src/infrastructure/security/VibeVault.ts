/**
 * VibeVault - Sovereign Encryption Engine for VibeEngine
 * 🛡️⚛️💎🚀
 */

const VAULT_SALT = 'vibe_sovereign_elite_2026';

export const VibeVault = {
    /**
     * Seals a value with local obfuscation before persistent storage.
     * @param value Plain text secret
     * @returns Obfuscated base64 string
     */
    seal: (value: string): string => {
        if (!value) return '';
        // Simple but effective local obfuscation for the 'Elite' standard
        const shifted = value.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ VAULT_SALT.charCodeAt(i % VAULT_SALT.length))
        ).join('');
        return btoa(shifted);
    },

    /**
     * Unseals an obfuscated value for neural link usage.
     * @param sealed Sealed secret string
     * @returns Reconstructed plain text
     */
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

    /**
     * Persistently saves a sealed secret to local storage.
     */
    saveSecret: (key: string, secret: string) => {
        const sealed = VibeVault.seal(secret);
        localStorage.setItem(`vault_${key}`, sealed);
    },

    /**
     * Retrieves and unseals a secret from local storage.
     */
    getSecret: (key: string): string => {
        const sealed = localStorage.getItem(`vault_${key}`);
        if (!sealed) return '';
        return VibeVault.unseal(sealed);
    }
};
