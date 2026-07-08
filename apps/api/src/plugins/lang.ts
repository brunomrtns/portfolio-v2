// ── Language plugin ───────────────────────────────────────────────────────────
// Extracts the requested language from Accept-Language header or ?lang= query.
// Falls back to pt-BR (the source language).

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const DEFAULT_LANG = 'pt-BR';
const SUPPORTED = ['pt-BR', 'en', 'es', 'fr', 'de', 'ja'];

declare module 'fastify' {
  interface FastifyRequest {
    lang: string;
  }
}

/**
 * Parse Accept-Language header and return the best matching language.
 * Format: "pt-BR,pt;q=0.9,en;q=0.8" → "pt-BR"
 */
function parseAcceptLanguage(header: string | undefined): string {
  if (!header) return DEFAULT_LANG;

  const languages = header
    .split(',')
    .map((part) => {
      const [lang, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { lang: lang.trim(), q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    // Exact match (e.g. "pt-BR")
    if (SUPPORTED.includes(lang)) return lang;
    // Prefix match (e.g. "pt" → "pt-BR", "en-US" → "en")
    const prefix = lang.split('-')[0];
    const match = SUPPORTED.find((s) => s.startsWith(prefix));
    if (match) return match;
  }

  return DEFAULT_LANG;
}

const langPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onRequest', async (request) => {
    // Check ?lang= query param first (explicit override)
    const queryLang = (request.query as { lang?: string })?.lang;
    if (queryLang && SUPPORTED.includes(queryLang)) {
      request.lang = queryLang;
      return;
    }

    // Fall back to Accept-Language header
    request.lang = parseAcceptLanguage(request.headers['accept-language']);
  });
};

export default fp(langPlugin);
