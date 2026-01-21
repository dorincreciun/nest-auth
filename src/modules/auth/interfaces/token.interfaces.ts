export interface ICreateToken {
    userId: number;
    tokenHashed: string;
    expiresAt: Date
}