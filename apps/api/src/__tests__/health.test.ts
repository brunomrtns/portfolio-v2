import { describe, it, expect, afterEach } from 'vitest';
import { buildApp } from './helpers';

describe('GET /api/health', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('returns 200 with status ok', async () => {
    app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  it('returns a valid ISO timestamp', async () => {
    app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    const { timestamp } = res.json();
    expect(() => new Date(timestamp).toISOString()).not.toThrow();
  });
});
