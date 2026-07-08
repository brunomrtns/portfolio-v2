import { describe, it, expect } from 'vitest';
import { AppError, AuthError, NotFoundError, ConflictError, ValidationError } from './index';

describe('error classes', () => {
  it('AppError carries statusCode, code, message and details', () => {
    const err = new AppError(418, 'TEAPOT', "I'm a teapot", { hint: 'check header' });
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.message).toBe("I'm a teapot");
    expect(err.details).toEqual({ hint: 'check header' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
  });

  it('AuthError defaults to 401', () => {
    const err = new AuthError('no token');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTH_ERROR');
    expect(err).toBeInstanceOf(AppError);
  });

  it('NotFoundError defaults to 404 and includes resource + id', () => {
    const err = new NotFoundError('Product', 'abc123');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('Product');
    expect(err.message).toContain('abc123');
  });

  it('ConflictError defaults to 409', () => {
    const err = new ConflictError('slug taken');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('ValidationError defaults to 400 and carries details', () => {
    const err = new ValidationError('bad input', [{ field: 'email' }]);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'email' }]);
  });

  it('AppError works without details', () => {
    const err = new AppError(500, 'INTERNAL', 'oops');
    expect(err.details).toBeUndefined();
  });
});
