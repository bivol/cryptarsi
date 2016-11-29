export declare class Crypto {
    constructor(password: string, nonce: string);
    decrypt(data: string, password?: string, nonce?: string): string;
    encrypt(data: string, password?: string, nonce?: string): string;
    setPassword(password: string): void;
    setNonce(nonce: string): void;
    dhs(word: string): string;
}
