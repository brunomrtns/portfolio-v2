import { describe, it, expect, afterEach } from 'vitest';
import { buildApp } from './helpers';

describe('Language detection', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('defaults to pt-BR when no header', async () => {
    app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
  });

  it('uses ?lang= query param override', async () => {
    app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health?lang=en' });
    expect(res.statusCode).toBe(200);
  });

  it('respects Accept-Language header (en)', async () => {
    app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { 'accept-language': 'en-US,en;q=0.9' },
    });
    expect(res.statusCode).toBe(200);
  });

  it('respects Accept-Language header (ja)', async () => {
    app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { 'accept-language': 'ja,en;q=0.8' },
    });
    expect(res.statusCode).toBe(200);
  });

  it('falls back to pt-BR for unsupported language', async () => {
    app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { 'accept-language': 'zh-CN' },
    });
    expect(res.statusCode).toBe(200);
  });

  it('query param takes precedence over header', async () => {
    app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/health?lang=de',
      headers: { 'accept-language': 'en' },
    });
    expect(res.statusCode).toBe(200);
  });
});
