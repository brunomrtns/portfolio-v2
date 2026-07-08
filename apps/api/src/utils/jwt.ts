import jwt from 'jsonwebtoken';

// ── JWT utilities ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT token.
 */
export function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: number = 7 * 24 * 60 * 60,
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify a JWT token and return the payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
