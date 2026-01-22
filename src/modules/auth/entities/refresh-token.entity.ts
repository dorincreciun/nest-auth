export class RefreshTokenEntity {
    id: number;
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}