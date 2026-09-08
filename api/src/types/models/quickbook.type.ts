export interface IQuickbook {
    ownerId: string;
    ownerType: string;
    isActive: boolean;
    accessToken: string;
    refreshToken: string;
    realmId: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    x_refresh_token_expires_in: number;
    expires_in: number;
    token_type: number;
}
