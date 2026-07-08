import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem } from '@/components/animation/reveal';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@portfolio/types';

export function Products(): React.ReactNode {
  const { data: products, isLoading } = useProducts();

  return (
    <section id="produtos" className="relative py-32">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="mesh-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">02</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              Produtos
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
            Soluções em <span className="gradient-text-accent">produção</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)]">
            Produtos digitais reais, construídos com tecnologias modernas e rodando
            em produção. Cada um resolve um problema específico com excelência técnica.
          </p>
        </Reveal>

        {/* Products grid */}
        <div className="mt-16">
          {isLoading ? (
            <ProductSkeleton />
          ) : products && products.length > 0 ? (
            <Stagger stagger={0.15} className="grid gap-6 lg:grid-cols-2">
              {products.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="text-center text-[var(--color-text-muted)]">
              Nenhum produto cadastrado ainda.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: ProductListItem }): React.ReactNode {
  const isFeatured = product.featured;
  const statusLabel =
    product.status === 'ACTIVE' ? 'Ativo' : product.status === 'COMING_SOON' ? 'Em breve' : 'Arquivado';

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block overflow-hidden rounded-2xl border bg-[var(--color-surface)] p-8 transition-all duration-500',
        'hover:border-[var(--color-border-bright)] hover:elevation-4',
        isFeatured
          ? 'border-[var(--color-border-bright)] elevation-3'
          : 'border-[var(--color-border)] elevation-2',
      )}
    >
      {/* Featured glow */}
      {isFeatured && (
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[var(--color-accent-glow)] opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-glow)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                <Sparkles className="h-3 w-3" />
                Destaque
              </span>
            )}
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)]">
              {statusLabel}
            </span>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[var(--color-text-muted)] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]" />
        </div>

        {/* Title */}
        <h3 className="mt-6 font-serif text-3xl font-bold text-[var(--color-text)]">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-medium text-[var(--color-accent)]">
          {product.tagline}
        </p>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
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
      </div>
    </a>
  );
}

function ProductSkeleton(): React.ReactNode {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
