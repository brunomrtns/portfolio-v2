import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './index';

describe('hashPassword / comparePassword', () => {
  it('hashes a password and verifies it', async () => {
    const hash = await hashPassword('mySecret123');
    expect(hash).not.toBe('mySecret123');
    expect(await comparePassword('mySecret123', hash)).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await hashPassword('correct');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });

  it('produces different hashes for the same input (salt)', async () => {
    const h1 = await hashPassword('same');
    const h2 = await hashPassword('same');
    expect(h1).not.toBe(h2);
  });

  it('handles unicode passwords', async () => {
    const pw = 'пароль🔐';
    const hash = await hashPassword(pw);
    expect(await comparePassword(pw, hash)).toBe(true);
  });
});
