import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@portfolio/types';

export function Products(): React.ReactNode {
  const { t } = useTranslation();
  const { data: products, isLoading } = useProducts();

  return (
    <section id="produtos" className="relative py-20 sm:py-32">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-8 sm:mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">03</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('products.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--color-text)] sm:text-5xl lg:text-6xl text-balance">
              {t('products.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-[var(--color-text-secondary)] text-pretty">
              {t('products.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* Products — large alternating cards */}
        <div className="mt-10 sm:mt-16 space-y-6">
          {isLoading ? (
            <ProductSkeleton />
          ) : products && products.length > 0 ? (
            <Stagger stagger={0.15} className="space-y-6">
              {products.map((product, i) => (
                <StaggerItem key={product.id} y={32}>
                  <ProductCard product={product} index={i} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="text-center text-[var(--color-text-muted)]">
              {t('products.empty')}
            </p>
          )}
        </div>

        <ScrollHint labelKey="scroll.productsToExperience" targetId="experiencia" />
      </div>
    </section>
  );
}

/* ── Generate a unique gradient per product name ──────────────────────────────── */
function getProductGradient(name: string): string {
  // Hash the product name to get a consistent hue
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsla(${hue1}, 70%, 50%, 0.15) 0%, hsla(${hue2}, 70%, 50%, 0.08) 50%, transparent 100%)`;
}

function ProductCard({
  product,
  index,
}: {
  product: ProductListItem;
  index: number;
}): React.ReactNode {
  const { t } = useTranslation();
  const isFeatured = product.featured;
  const isReversed = index % 2 === 1;
  const statusLabel =
    product.status === 'ACTIVE'
      ? t('products.statusActive')
      : product.status === 'COMING_SOON'
        ? t('products.statusComingSoon')
        : t('products.statusArchived');

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      className={cn(
        'card-premium group relative block',
        isFeatured ? 'gradient-border-active elevation-3' : 'elevation-2',
      )}
    >
      {/* Featured glow — intensifies on hover */}
      {isFeatured && (
        <div className="pointer-events-none absolute -right-40 -top-40 h-40 w-40 rounded-full bg-[var(--color-accent-glow)] opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60 sm:h-80 sm:w-80" />
      )}

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:p-12">
        {/* Left — content */}
        <div className={cn(isReversed && 'lg:order-2')}>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {isFeatured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-glow)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                <Sparkles className="h-3 w-3" />
                {t('products.featured')}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              {statusLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-6 font-serif text-3xl font-bold tracking-[-0.03em] text-[var(--color-text)] sm:text-4xl lg:text-5xl text-balance">
            {product.name}
          </h3>
          <p className="mt-3 text-lg font-medium text-[var(--color-accent)]">
            {product.tagline}
          </p>

          {/* Description */}
          <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--color-text-secondary)] text-pretty">
            {product.description}
          </p>

          {/* Tech badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tech.map((tech) => (
              <span key={tech} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>

          {/* CTA — with animated arrow */}
          <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
            <span className="link-underline">{t('products.accessProduct')}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Right — visual preview area with unique gradient per product */}
        <div className={cn('flex flex-col justify-center', isReversed && 'lg:order-1')}>
          <div
            className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-6 backdrop-blur-sm transition-all duration-500 group-hover:border-[var(--color-border-bright)]"
            style={{ backgroundImage: getProductGradient(product.name) }}
          >
            {/* Animated glow that follows hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-20 -top-20 h-24 w-24 rounded-full bg-[var(--color-accent-glow)] blur-3xl sm:h-40 sm:w-40" />
            </div>

            <div className="relative">
              {/* Product initial — large, serif, as a visual identity element */}
              <p className="font-serif text-5xl font-bold leading-none text-[var(--color-text)]/10 transition-all duration-500 group-hover:text-[var(--color-text)]/15 group-hover:scale-105 sm:text-7xl">
                {product.name.charAt(0)}
              </p>

              {/* Status indicator — visual element */}
              <div className="mt-6 space-y-3">
                {/* Animated bar — represents "active" status */}
                <div className="flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        product.status === 'ACTIVE'
                          ? 'w-full bg-[var(--color-accent)]'
                          : product.status === 'COMING_SOON'
                            ? 'w-1/3 bg-[var(--color-accent-warm)]'
                            : 'w-0 bg-[var(--color-text-muted)]',
                      )}
                    />
                  </div>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {statusLabel}
                  </span>
                </div>

                {/* Tech count indicator */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {t('products.stack')}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                    {product.tech.length} {t('products.stack').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function ProductSkeleton(): React.ReactNode {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
