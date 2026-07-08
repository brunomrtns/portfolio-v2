import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  createArticleSchema,
  updateArticleSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createSkillSchema,
  updateSkillSchema,
  createExperienceSchema,
  updateExperienceSchema,
  slugify,
  NotFoundError,
  ConflictError,
} from '@portfolio/shared';
import { requireAuth } from '../plugins/auth.js';
import { generateAllTranslations } from '../services/translate.js';

// ── Admin routes (all require auth) ───────────────────────────────────────────

const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/products', async () => {
    return app.prisma.product.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  app.post('/products', async (request, reply) => {
    const data = createProductSchema.parse(request.body);

    const slug = data.slug ?? slugify(data.name);

    const existing = await app.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError(`Product with slug "${slug}" already exists`);
    }

    // Generate translations for all supported languages (pt-BR is source)
    const translations = await generateAllTranslations(
      {
        tagline: data.tagline,
        description: data.description,
        longDescription: data.longDescription ?? null,
      },
      { features: data.features },
    );

    const product = await app.prisma.product.create({
      data: { ...data, slug, translations },
    });

    return reply.status(201).send(product);
  });

  app.get<{ Params: { id: string } }>('/products/:id', async (request) => {
    const product = await app.prisma.product.findUnique({
      where: { id: request.params.id },
    });
    if (!product) {
      throw new NotFoundError('Product', request.params.id);
    }
    return product;
  });

  app.put<{ Params: { id: string } }>('/products/:id', async (request) => {
    const data = updateProductSchema.parse(request.body);

    const existing = await app.prisma.product.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Product', request.params.id);
    }

    // Auto-generate slug if name changed and slug not provided
    let slug = data.slug;
    if (!slug && data.name && data.name !== existing.name) {
      slug = slugify(data.name);
    }

    if (slug && slug !== existing.slug) {
      const conflict = await app.prisma.product.findUnique({ where: { slug } });
      if (conflict) {
        throw new ConflictError(`Product with slug "${slug}" already exists`);
      }
    }

    // Regenerate translations if translatable fields changed
    const newTagline = data.tagline ?? existing.tagline;
    const newDescription = data.description ?? existing.description;
    const newLongDescription = data.longDescription ?? existing.longDescription ?? null;
    const newFeatures = data.features ?? existing.features;

    const translations = await generateAllTranslations(
      {
        tagline: newTagline,
        description: newDescription,
        longDescription: newLongDescription,
      },
      { features: newFeatures },
    );

    return app.prisma.product.update({
      where: { id: request.params.id },
      data: { ...data, ...(slug ? { slug } : {}), translations },
    });
  });

  app.delete<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const existing = await app.prisma.product.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Product', request.params.id);
    }

    await app.prisma.product.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ARTICLES
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/articles', async () => {
    return app.prisma.article.findMany({
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post('/articles', async (request, reply) => {
    const data = createArticleSchema.parse(request.body);

    const slug = data.slug ?? slugify(data.title);

    const existing = await app.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError(`Article with slug "${slug}" already exists`);
    }

    const { categoryIds, ...articleData } = data;

    const publishedAt =
      data.status === 'PUBLISHED' && data.publishedAt
        ? new Date(data.publishedAt)
        : data.status === 'PUBLISHED'
          ? new Date()
          : null;

    // Generate translations
    const translations = await generateAllTranslations({
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
    });

    const article = await app.prisma.article.create({
      data: {
        title: articleData.title,
        slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        coverUrl: articleData.coverUrl ?? null,
        status: articleData.status,
        publishedAt,
        translations,
        ...(categoryIds && categoryIds.length > 0
          ? {
              categories: {
                create: categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : {}),
      },
      include: { categories: { include: { category: true } } },
    });

    return reply.status(201).send(article);
  });

  app.get<{ Params: { id: string } }>('/articles/:id', async (request) => {
    const article = await app.prisma.article.findUnique({
      where: { id: request.params.id },
      include: { categories: { include: { category: true } } },
    });
    if (!article) {
      throw new NotFoundError('Article', request.params.id);
    }
    return article;
  });

  app.put<{ Params: { id: string } }>('/articles/:id', async (request) => {
    const data = updateArticleSchema.parse(request.body);

    const existing = await app.prisma.article.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Article', request.params.id);
    }

    let slug = data.slug;
    if (!slug && data.title && data.title !== existing.title) {
      slug = slugify(data.title);
    }

    if (slug && slug !== existing.slug) {
      const conflict = await app.prisma.article.findUnique({ where: { slug } });
      if (conflict) {
        throw new ConflictError(`Article with slug "${slug}" already exists`);
      }
    }

    const { categoryIds, ...articleData } = data;

    // Handle publishedAt logic
    let publishedAt: Date | null | undefined = undefined;
    if (articleData.status === 'PUBLISHED') {
      if (articleData.publishedAt) {
        publishedAt = new Date(articleData.publishedAt);
      } else if (!existing.publishedAt) {
        publishedAt = new Date();
      }
    } else if (articleData.status === 'DRAFT') {
      publishedAt = null;
    }

    // Update categories if provided
    if (categoryIds !== undefined) {
      await app.prisma.articleCategory.deleteMany({
        where: { articleId: request.params.id },
      });
      if (categoryIds.length > 0) {
        await app.prisma.articleCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            articleId: request.params.id,
            categoryId,
          })),
        });
      }
    }

    // Regenerate translations if translatable fields changed
    const newTitle = articleData.title ?? existing.title;
    const newExcerpt = articleData.excerpt ?? existing.excerpt;
    const newContent = articleData.content ?? existing.content;
    const translations = await generateAllTranslations({
      title: newTitle,
      excerpt: newExcerpt,
      content: newContent,
    });

    return app.prisma.article.update({
      where: { id: request.params.id },
      data: {
        ...(articleData.title !== undefined ? { title: articleData.title } : {}),
        ...(slug ? { slug } : {}),
        ...(articleData.excerpt !== undefined ? { excerpt: articleData.excerpt } : {}),
        ...(articleData.content !== undefined ? { content: articleData.content } : {}),
        ...(articleData.coverUrl !== undefined ? { coverUrl: articleData.coverUrl ?? null } : {}),
        ...(articleData.status !== undefined ? { status: articleData.status } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        translations,
      },
      include: { categories: { include: { category: true } } },
    });
  });

  app.delete<{ Params: { id: string } }>('/articles/:id', async (request, reply) => {
    const existing = await app.prisma.article.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Article', request.params.id);
    }

    await app.prisma.article.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CATEGORIES
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/categories', async () => {
    return app.prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });
  });

  app.post('/categories', async (request, reply) => {
    const data = createCategorySchema.parse(request.body);

    const slug = data.slug ?? slugify(data.name);

    const existing = await app.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError(`Category with slug "${slug}" already exists`);
    }

    const translations = await generateAllTranslations({ name: data.name });

    const category = await app.prisma.category.create({
      data: { name: data.name, slug, color: data.color, translations },
    });

    return reply.status(201).send(category);
  });

  app.get<{ Params: { id: string } }>('/categories/:id', async (request) => {
    const category = await app.prisma.category.findUnique({
      where: { id: request.params.id },
    });
    if (!category) {
      throw new NotFoundError('Category', request.params.id);
    }
    return category;
  });

  app.put<{ Params: { id: string } }>('/categories/:id', async (request) => {
    const data = updateCategorySchema.parse(request.body);

    const existing = await app.prisma.category.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Category', request.params.id);
    }

    let slug = data.slug;
    if (!slug && data.name && data.name !== existing.name) {
      slug = slugify(data.name);
    }

    if (slug && slug !== existing.slug) {
      const conflict = await app.prisma.category.findUnique({ where: { slug } });
      if (conflict) {
        throw new ConflictError(`Category with slug "${slug}" already exists`);
      }
    }

    const newName = data.name ?? existing.name;
    const translations = await generateAllTranslations({ name: newName });

    return app.prisma.category.update({
      where: { id: request.params.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(slug ? { slug } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        translations,
      },
    });
  });

  app.delete<{ Params: { id: string } }>('/categories/:id', async (request, reply) => {
    const existing = await app.prisma.category.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Category', request.params.id);
    }

    await app.prisma.category.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SKILLS
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/skills', async () => {
    return app.prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  });

  app.post('/skills', async (request, reply) => {
    const data = createSkillSchema.parse(request.body);

    const translations = await generateAllTranslations({ name: data.name });

    const skill = await app.prisma.skill.create({ data: { ...data, translations } });
    return reply.status(201).send(skill);
  });

  app.get<{ Params: { id: string } }>('/skills/:id', async (request) => {
    const skill = await app.prisma.skill.findUnique({
      where: { id: request.params.id },
    });
    if (!skill) {
      throw new NotFoundError('Skill', request.params.id);
    }
    return skill;
  });

  app.put<{ Params: { id: string } }>('/skills/:id', async (request) => {
    const data = updateSkillSchema.parse(request.body);

    const existing = await app.prisma.skill.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Skill', request.params.id);
    }

    const newName = data.name ?? existing.name;
    const translations = await generateAllTranslations({ name: newName });

    return app.prisma.skill.update({
      where: { id: request.params.id },
      data: { ...data, translations },
    });
  });

  app.delete<{ Params: { id: string } }>('/skills/:id', async (request, reply) => {
    const existing = await app.prisma.skill.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Skill', request.params.id);
    }

    await app.prisma.skill.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // EXPERIENCE
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/experience', async () => {
    return app.prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });
  });

  app.post('/experience', async (request, reply) => {
    const data = createExperienceSchema.parse(request.body);

    const translations = await generateAllTranslations(
      {
        role: data.role,
        company: data.company,
        description: data.description ?? null,
      },
      { achievements: data.achievements },
    );

    const experience = await app.prisma.experience.create({
      data: {
        role: data.role,
        company: data.company,
        location: data.location ?? null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: data.current,
        description: data.description ?? null,
        achievements: data.achievements,
        order: data.order,
        translations,
      },
    });

    return reply.status(201).send(experience);
  });

  app.get<{ Params: { id: string } }>('/experience/:id', async (request) => {
    const experience = await app.prisma.experience.findUnique({
      where: { id: request.params.id },
    });
    if (!experience) {
      throw new NotFoundError('Experience', request.params.id);
    }
    return experience;
  });

  app.put<{ Params: { id: string } }>('/experience/:id', async (request) => {
    const data = updateExperienceSchema.parse(request.body);

    const existing = await app.prisma.experience.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Experience', request.params.id);
    }

    const newRole = data.role ?? existing.role;
    const newCompany = data.company ?? existing.company;
    const newDescription = data.description ?? existing.description ?? null;
    const newAchievements = data.achievements ?? existing.achievements;

    const translations = await generateAllTranslations(
      {
        role: newRole,
        company: newCompany,
        description: newDescription,
      },
      { achievements: newAchievements },
    );

    return app.prisma.experience.update({
      where: { id: request.params.id },
      data: {
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.company !== undefined ? { company: data.company } : {}),
        ...(data.location !== undefined ? { location: data.location ?? null } : {}),
        ...(data.startDate !== undefined ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
        ...(data.current !== undefined ? { current: data.current } : {}),
        ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        ...(data.achievements !== undefined ? { achievements: data.achievements } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        translations,
      },
    });
  });

  app.delete<{ Params: { id: string } }>('/experience/:id', async (request, reply) => {
    const existing = await app.prisma.experience.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Experience', request.params.id);
    }

    await app.prisma.experience.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // MESSAGES
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/messages', async (request) => {
    const unreadOnly = (request.query as { unread?: string })?.unread === 'true';

    return app.prisma.contactMessage.findMany({
      where: unreadOnly ? { read: false } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  });

  app.get<{ Params: { id: string } }>('/messages/:id', async (request) => {
    const message = await app.prisma.contactMessage.findUnique({
      where: { id: request.params.id },
    });
    if (!message) {
      throw new NotFoundError('Message', request.params.id);
    }
    return message;
  });

  app.put<{ Params: { id: string } }>('/messages/:id/read', async (request) => {
    const existing = await app.prisma.contactMessage.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Message', request.params.id);
    }

    return app.prisma.contactMessage.update({
      where: { id: request.params.id },
      data: { read: true },
    });
  });

  app.delete<{ Params: { id: string } }>('/messages/:id', async (request, reply) => {
    const existing = await app.prisma.contactMessage.findUnique({
      where: { id: request.params.id },
    });
    if (!existing) {
      throw new NotFoundError('Message', request.params.id);
    }

    await app.prisma.contactMessage.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });
};

export default adminRoutes;
