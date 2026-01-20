export class UserEntity {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    verificationToken: string | null;
}