import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, type JwtPayload } from '../utils/jwt';

const SECRET = 'test-secret-at-least-32-chars';

describe('JWT utilities', () => {
  const payload: JwtPayload = {
    userId: 'user-1',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  it('signs and verifies a token', () => {
    const token = signToken(payload, SECRET);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token, SECRET);
    expect(decoded.userId).toBe('user-1');
    expect(decoded.email).toBe('admin@test.com');
    expect(decoded.role).toBe('ADMIN');
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('not.a.jwt', SECRET)).toThrow();
  });

  it('throws on wrong secret', () => {
    const token = signToken(payload, SECRET);
    expect(() => verifyToken(token, 'wrong-secret')).toThrow();
  });

  it('includes expiration', () => {
    const token = signToken(payload, SECRET, 1);
    const decoded = verifyToken(token, SECRET);
    expect(decoded.userId).toBe('user-1');
  });
});
