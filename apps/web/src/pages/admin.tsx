import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, LogOut, FileText, Package, Inbox, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Article, Product, ContactMessage } from '@portfolio/types';

interface LoginValues { email: string; password: string; }

export default function AdminPage(): React.ReactNode {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, init, login, logout } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    document.title = t('meta.adminTitle');
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}

// ── Login View ────────────────────────────────────────────────────────────────

function LoginView({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }): React.ReactNode {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t('admin.validationEmailInvalid')),
    password: z.string().min(1, t('admin.validationPasswordRequired')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues): Promise<void> => {
    setSubmitting(true);
    try {
      await onLogin(values.email, values.password);
      toast.success(t('admin.loginSuccess'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.loginError');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <div className="mesh-bg-dense" />
      <div className="noise" />

      <div className="relative w-full max-w-md px-6">
        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-glow)]">
              <Lock className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text)]">
              {t('admin.title')}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t('admin.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t('admin.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">{t('admin.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('admin.login')
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

type Tab = 'articles' | 'products' | 'messages';

function Dashboard({ user, onLogout }: { user: { email: string } | null; onLogout: () => void }): React.ReactNode {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('articles');

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-strong border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[var(--color-text)]">
              admin<span className="text-[var(--color-accent)]">.</span>panel
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">|</span>
            <span className="text-sm text-[var(--color-text-secondary)]">{user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            {t('admin.logout')}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex gap-2 max-sm:overflow-x-auto max-sm:pb-1">
          {([
            { id: 'articles', label: t('admin.tabsArticles'), icon: FileText },
            { id: 'products', label: t('admin.tabsProducts'), icon: Package },
            { id: 'messages', label: t('admin.tabsMessages'), icon: Inbox },
          ] as const).map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
                tab === tabItem.id
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border-bright)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              <tabItem.icon className="h-4 w-4" />
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'articles' && <ArticlesTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'messages' && <MessagesTab />}
      </div>
    </div>
  );
}

// ── Articles Tab ──────────────────────────────────────────────────────────────

function ArticlesTab(): React.ReactNode {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.admin.articles.list();
      setArticles(data);
    } catch {
      toast.error(t('admin.articlesLoadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (creating || editing) {
    return (
      <ArticleEditor
        article={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('admin.articlesTitle')}</h2>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          {t('admin.newArticle')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">{article.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {article.status === 'PUBLISHED' ? t('admin.statusPublished') : t('admin.statusDraft')} ·{' '}
                  {new Date(article.createdAt).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language)}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button variant="ghost" size="icon" onClick={() => setEditing(article)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!confirm(t('admin.deleteConfirmArticle'))) return;
                    try {
                      await api.admin.articles.delete(article.id);
                      toast.success(t('admin.articleDeleted'));
                      load();
                    } catch {
                      toast.error(t('admin.articleDeleteError'));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleEditor({ article, onClose }: { article: Article | null; onClose: () => void }): React.ReactNode {
  const { t } = useTranslation();
  const [title, setTitle] = useState(article?.title ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(article?.status ?? 'DRAFT');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { title, excerpt, content, status };
      if (article) {
        await api.admin.articles.update(article.id, data);
        toast.success(t('admin.articleUpdated'));
      } else {
        await api.admin.articles.create(data);
        toast.success(t('admin.articleCreated'));
      }
      onClose();
    } catch {
      toast.error(t('admin.articleSaveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {article ? t('admin.editArticle') : t('admin.newArticle')}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('admin.cancel')}</Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-title">{t('admin.articleTitle')}</Label>
        <Input id="article-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-excerpt">{t('admin.articleExcerpt')}</Label>
        <Input id="article-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-content">{t('admin.articleContent')}</Label>
        <Textarea
          id="article-content"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-status">{t('admin.articleStatus')}</Label>
        <select
          id="article-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
          className="flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)]"
        >
          <option value="DRAFT">{t('admin.statusDraft')}</option>
          <option value="PUBLISHED">{t('admin.statusPublished')}</option>
        </select>
      </div>

      <Button variant="primary" size="lg" disabled={saving} onClick={handleSave}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.save')}
      </Button>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

function ProductsTab(): React.ReactNode {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.products.list();
        setProducts(data);
      } catch {
        toast.error(t('admin.productsLoadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('admin.productsTitle')}</h2>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">{product.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {product.tagline} · {product.status}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!confirm(t('admin.deleteConfirmProduct'))) return;
                    try {
                      await api.admin.products.delete(product.id);
                      toast.success(t('admin.productDeleted'));
                      setProducts(products.filter((p) => p.id !== product.id));
                    } catch {
                      toast.error(t('admin.productDeleteError'));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab(): React.ReactNode {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.messages.list();
        setMessages(data);
      } catch {
        toast.error(t('admin.messagesLoadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t('admin.messagesTitle')}</h2>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">{t('admin.messagesEmpty')}</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg border bg-[var(--color-surface)] p-4',
                msg.read ? 'border-[var(--color-border)]' : 'border-[var(--color-accent)]',
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{msg.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{msg.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {new Date(msg.createdAt).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language)}
                  </span>
                  {!msg.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.admin.messages.markRead(msg.id);
                          setMessages(messages.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
                        } catch {
                          toast.error('Erro ao marcar como lida');
                        }
                      }}
                    >
                      Marcar lida
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
