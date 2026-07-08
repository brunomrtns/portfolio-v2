// ── Translation service ───────────────────────────────────────────────────────
// Uses Google Translate's free public endpoint (same as @vitalets/google-translate-api).
// No API key, no token, no cost. Rate-limited by Google's own throttling.

const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

// Languages we support (must match frontend i18n locales)
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

// Source language is always pt-BR (content is authored in Portuguese)
const SOURCE_LANG = 'pt';

/**
 * Translate a single string from pt-BR to the target language.
 * Uses Google Translate's free endpoint — no API key required.
 */
export async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  // Google Translate uses 'pt-BR' → 'pt' for source, and target codes like 'en', 'ja', etc.
  const target = targetLang === 'pt-BR' ? 'pt' : targetLang;

  const params = new URLSearchParams({
    client: 'gtx',
    sl: SOURCE_LANG,
    tl: target,
    dt: 't',
    q: text,
  });

  const url = `${GOOGLE_TRANSLATE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Translate returned ${response.status}`);
    }

    const data = await response.json();

    // Response format: [[["translated text","original text",null,null,...],...],...]
    // We need to concatenate all translated segments
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((segment: unknown[]) => (segment[0] as string) ?? '')
        .join('');
      return translated;
    }

    throw new Error('Unexpected Google Translate response format');
  } catch (error) {
    console.error(`[translate] Failed to translate to ${targetLang}:`, error);
    // Return original text on failure — fallback to pt-BR
    return text;
  }
}

/**
 * Translate multiple strings in parallel (with small concurrency limit).
 * Returns an object mapping the same keys to translated values.
 */
export async function translateFields(
  fields: Record<string, string | null | undefined>,
  targetLang: string,
): Promise<Record<string, string>> {
  const entries = Object.entries(fields);
  const results: Record<string, string> = {};

  // Translate in batches of 5 to avoid rate limiting
  const BATCH_SIZE = 5;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const translated = await Promise.all(
      batch.map(async ([key, value]) => [
        key,
        value ? await translateText(value, targetLang) : '',
      ]),
    );
    for (const [key, value] of translated) {
      results[key] = value as string;
    }
  }

  return results;
}

/**
 * Translate an array of strings (e.g. achievements list).
 */
export async function translateArray(
  arr: string[],
  targetLang: string,
): Promise<string[]> {
  const fields: Record<string, string> = {};
  arr.forEach((item, i) => { fields[`item_${i}`] = item; });

  const translated = await translateFields(fields, targetLang);
  return arr.map((_, i) => translated[`item_${i}`] ?? arr[i]);
}

/**
 * Generate translations for all supported languages.
 * Returns: { "en": { ... }, "es": { ... }, "ja": { ... }, ... }
 */
export async function generateAllTranslations(
  fields: Record<string, string | null | undefined>,
  arrayFields?: Record<string, string[]>,
): Promise<Record<string, Record<string, string | string[]>>> {
  const translations: Record<string, Record<string, string | string[]>> = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    const stringTranslations = await translateFields(fields, lang);
    const arrayTranslations: Record<string, string[]> = {};

    if (arrayFields) {
      for (const [key, arr] of Object.entries(arrayFields)) {
        arrayTranslations[key] = await translateArray(arr, lang);
      }
    }

    translations[lang] = { ...stringTranslations, ...arrayTranslations };
  }

  return translations;
}

/**
 * Apply translations to a record based on the requested language.
 * Falls back to original (pt-BR) values if translation is missing.
 */
export function applyTranslations<T extends Record<string, unknown>>(
  record: T,
  translations: unknown | null,
  lang: string,
  translatableFields: string[],
  arrayFields: string[] = [],
): T {
  // pt-BR is the source — no translation needed
  if (lang === 'pt-BR' || lang === 'pt' || !translations) {
    return record;
  }

  const langTranslations = (translations as Record<string, Record<string, string | string[]>>)?.[lang];
  if (!langTranslations) {
    return record;
  }

  const result = { ...record };

  for (const field of translatableFields) {
    if (langTranslations[field] !== undefined && langTranslations[field] !== '') {
      (result as Record<string, unknown>)[field] = langTranslations[field];
    }
  }

  for (const field of arrayFields) {
    if (Array.isArray(langTranslations[field]) && (langTranslations[field] as string[]).length > 0) {
      (result as Record<string, unknown>)[field] = langTranslations[field];
    }
  }

  return result;
}
