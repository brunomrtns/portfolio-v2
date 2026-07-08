import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { contactSchema, NotFoundError } from '@portfolio/shared';
import type {
  Product,
  ProductListItem,
  Article,
  ArticleListItem,
  Category,
  Skill,
  Experience,
  ContactMessage,
} from '@portfolio/types';
import { applyTranslations } from '../services/translate.js';

// ── Public routes ─────────────────────────────────────────────────────────────

const publicRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // ── Products ────────────────────────────────────────────────────────────────

  app.get('/products', async (request): Promise<ProductListItem[]> => {
    const products = await app.prisma.product.findMany({
      orderBy: [
        { featured: 'desc' },
        { status: 'asc' },
        { order: 'asc' },
      ],
    });

    return products.map((p) => {
      const base = {
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        slug: p.slug,
        url: p.url,
        imageUrl: p.imageUrl,
        logoUrl: p.logoUrl,
        tech: p.tech,
        status: p.status as ProductListItem['status'],
        featured: p.featured,
      };
      return applyTranslations(base, p.translations, request.lang, ['tagline', 'description']);
    });
  });

  app.get<{ Params: { slug: string } }>(
    '/products/:slug',
    async (request, reply): Promise<Product> => {
      const { slug } = request.params;

      const product = await app.prisma.product.findUnique({
        where: { slug },
      });

      if (!product) {
        throw new NotFoundError('Product', slug);
      }

      const base = {
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        longDescription: product.longDescription,
        slug: product.slug,
        url: product.url,
        repoUrl: product.repoUrl,
        imageUrl: product.imageUrl,
        logoUrl: product.logoUrl,
        tech: product.tech,
        features: product.features,
        status: product.status as Product['status'],
        featured: product.featured,
        order: product.order,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };

      const translated = applyTranslations(
        base,
        product.translations,
        request.lang,
        ['tagline', 'description', 'longDescription'],
        ['features'],
      );

      return reply.send(translated);
    },
  );

  // ── Articles ────────────────────────────────────────────────────────────────

  app.get<{
    Querystring: { page?: string; limit?: string; categoryId?: string };
  }>(
    '/articles',
    async (request): Promise<{
      items: ArticleListItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> => {
      const page = Math.max(1, parseInt(request.query.page ?? '1', 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(request.query.limit ?? '10', 10) || 10));
      const { categoryId } = request.query;

      const where = {
        status: 'PUBLISHED',
        ...(categoryId ? { categories: { some: { categoryId } } } : {}),
      };

      const [total, articles] = await Promise.all([
        app.prisma.article.count({ where }),
        app.prisma.article.findMany({
          where,
          include: {
            categories: { include: { category: true } },
          },
          orderBy: { publishedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return {
        items: articles.map((a) => {
          const base = {
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            coverUrl: a.coverUrl,
            status: a.status as ArticleListItem['status'],
            publishedAt: a.publishedAt?.toISOString() ?? null,
            createdAt: a.createdAt.toISOString(),
            categories: a.categories.map((ac) => {
              const catBase = {
                id: ac.category.id,
                name: ac.category.name,
                slug: ac.category.slug,
                color: ac.category.color,
              };
              return applyTranslations(catBase, ac.category.translations, request.lang, ['name']);
            }),
          };
          return applyTranslations(base, a.translations, request.lang, ['title', 'excerpt']);
        }),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },
  );

  app.get<{ Params: { slug: string } }>(
    '/articles/:slug',
    async (request, reply): Promise<Article> => {
      const { slug } = request.params;

      const article = await app.prisma.article.findUnique({
        where: { slug },
        include: {
          categories: { include: { category: true } },
        },
      });

      if (!article || article.status !== 'PUBLISHED') {
        throw new NotFoundError('Article', slug);
      }

      const base = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverUrl: article.coverUrl,
        status: article.status as Article['status'],
        publishedAt: article.publishedAt?.toISOString() ?? null,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        categories: article.categories.map((ac) => {
          const catBase = {
            id: ac.category.id,
            name: ac.category.name,
            slug: ac.category.slug,
            color: ac.category.color,
          };
          return applyTranslations(catBase, ac.category.translations, request.lang, ['name']);
        }),
      };

      const translated = applyTranslations(
        base,
        article.translations,
        request.lang,
        ['title', 'excerpt', 'content'],
      );

      return reply.send(translated);
    },
  );

  // ── Categories ───────────────────────────────────────────────────────────────

  app.get('/categories', async (request): Promise<(Category & { articleCount: number })[]> => {
    const categories = await app.prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => {
      const base = {
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        articleCount: c._count.articles,
      };
      return applyTranslations(base, c.translations, request.lang, ['name']);
    });
  });

  // ── Skills ──────────────────────────────────────────────────────────────────

  app.get('/skills', async (request): Promise<Skill[]> => {
    const skills = await app.prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    return skills.map((s) => {
      const base = {
        id: s.id,
        name: s.name,
        category: s.category,
        icon: s.icon,
        order: s.order,
      };
      return applyTranslations(base, s.translations, request.lang, ['name']);
    });
  });

  // ── Experience ───────────────────────────────────────────────────────────────

  app.get('/experience', async (request): Promise<Experience[]> => {
    const experiences = await app.prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });

    return experiences.map((e) => {
      const base = {
        id: e.id,
        role: e.role,
        company: e.company,
        location: e.location,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        current: e.current,
        description: e.description,
        achievements: e.achievements,
        order: e.order,
      };
      return applyTranslations(
        base,
        e.translations,
        request.lang,
        ['role', 'company', 'description'],
        ['achievements'],
      );
    });
  });

  // ── Contact ──────────────────────────────────────────────────────────────────

  app.post('/contact', async (request, reply): Promise<{ message: string; id: string }> => {
    const data = contactSchema.parse(request.body);

    const message = await app.prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });

    return reply.status(201).send({
      message: 'Message sent successfully',
      id: message.id,
    });
  });
};

export default publicRoutes;

// Type export for ContactMessage response convenience
export type { ContactMessage };
