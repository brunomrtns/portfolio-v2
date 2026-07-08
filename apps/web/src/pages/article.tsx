import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/sections/footer';
import { useArticle } from '@/hooks/use-data';
import { Reveal } from '@/components/animation/reveal';
import { PageLoader } from '@/components/ui/page-loader';

export default function ArticlePage(): React.ReactNode {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? '');

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Bruno Integrations`;
    }
  }, [article]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageLoader />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-[var(--color-text)]">
              Artigo não encontrado
            </h1>
            <Link
              to="/blog"
              className="mt-4 inline-flex items-center gap-2 text-[var(--color-accent)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao blog
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32">
        <article className="mx-auto max-w-3xl px-6">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao blog
          </Link>

          {/* Header */}
          <Reveal>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {article.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
                  style={{ color: cat.color, backgroundColor: `${cat.color}15` }}
                >
                  <Tag className="h-3 w-3" />
                  {cat.name}
                </span>
              ))}
              {article.publishedAt && (
                <span className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-muted)]">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl">
              {article.title}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              {article.excerpt}
            </p>
          </Reveal>

          {/* Content */}
          <Reveal delay={0.3}>
            <div className="prose mt-12">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>
          </Reveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
