import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/sections/footer';
import { useArticles, useCategories } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem } from '@/components/animation/reveal';
import { cn } from '@/lib/utils';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export default function BlogPage(): React.ReactNode {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: categories } = useCategories();
  const { data, isLoading } = useArticles({ page: 1, limit: 50, categoryId: selectedCategory });

  useEffect(() => {
    document.title = t('meta.blogTitle');
  }, [t]);

  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language;

  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-32">
        <div className="container-wide">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('blog.backHome')}
          </Link>

          {/* Header */}
          <Reveal>
            <h1 className="mt-8 font-serif text-4xl font-bold text-[var(--color-text)] sm:text-5xl">
              {t('blog.title')}
            </h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              {t('blog.subtitle')}
            </p>
          </Reveal>

          {/* Category filters */}
          {categories && categories.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm transition-all duration-300',
                    !selectedCategory
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-bright)]',
                  )}
                >
                  {t('blog.allCategories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm transition-all duration-300',
                      selectedCategory === cat.id
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-bright)]',
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* Articles */}
          <div className="mt-12">
            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <Stagger stagger={0.1} className="space-y-4">
                {data.items.map((article) => (
                  <StaggerItem key={article.id}>
                    <Link
                      to={`/portfolio/blog/${article.slug}`}
                      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-500 hover:border-[var(--color-border-bright)] hover:elevation-3"
                    >
                      <div className="flex items-center gap-4">
                        {article.categories.length > 0 && (
                          <div className="flex gap-2">
                            {article.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
                                style={{
                                  color: cat.color,
                                  backgroundColor: `${cat.color}15`,
                                }}
                              >
                                <Tag className="h-3 w-3" />
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {article.publishedAt && (
                          <span className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-muted)]">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.publishedAt).toLocaleDateString(locale, {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {article.excerpt}
                      </p>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg text-[var(--color-text-muted)]">
                  {t('blog.empty')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t('blog.emptyHint')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
