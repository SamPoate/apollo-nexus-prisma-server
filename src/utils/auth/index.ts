import * as jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
    userId: string;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload {
    const token = authHeader.replace('Bearer ', '');
    const APP_SECRET = process.env.APP_SECRET;

    if (!APP_SECRET) {
        throw new Error('Invalid Operation');
    }

    if (!token) {
        throw new Error('No token found');
    }

    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
