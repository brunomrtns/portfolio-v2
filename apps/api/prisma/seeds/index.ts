import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@portfolio/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'brunomartinsss@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`  ✓ Admin user created (${adminEmail})`);
  } else {
    console.log(`  → Admin user already exists (${adminEmail})`);
  }

  // ── Products ────────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Trivestia',
      tagline: 'Plataforma de estudos financeiros',
      description:
        'Plataforma completa para estudos e análise financeira, com ferramentas para controle, planejamento e acompanhamento de investimentos.',
      longDescription:
        'Trivestia é uma plataforma de estudos financeiros desenvolvida para ajudar usuários a compreender e gerenciar suas finanças de forma prática. Inclui dashboards, relatórios e ferramentas de análise para apoiar decisões financeiras.',
      slug: 'trivestia',
      url: 'https://brunointegrations.com/trivestia',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'nginx'],
      features: [
        'Dashboard de estudos financeiros',
        'Análise e relatórios personalizados',
        'Controle de investimentos',
      ],
      status: 'ACTIVE',
      featured: true,
      order: 0,
    },
    {
      name: 'Avesia',
      tagline: 'Plataforma de auxílio médico clínico com IA',
      description:
        'Plataforma de auxílio médico clínico com inteligência artificial, integrando busca semântica e agentes de IA para apoiar decisões clínicas.',
      longDescription:
        'Avesia é uma plataforma de auxílio médico clínico que utiliza IA para fornecer suporte na tomada de decisões. Combina busca semântica com pgvector, agentes de IA e pipelines assíncronos para processar e analisar dados clínicos.',
      slug: 'avesia',
      url: 'https://brunointegrations.com/avesia',
      tech: ['React', 'Fastify', 'Prisma', 'PostgreSQL', 'Python', 'Celery', 'pgvector', 'AI'],
      features: [
        'Busca semântica com pgvector',
        'Agentes de IA para auxílio clínico',
        'Pipelines assíncronos com Celery',
      ],
      status: 'ACTIVE',
      featured: true,
      order: 1,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`  ✓ Product created: ${product.name}`);
    } else {
      console.log(`  → Product already exists: ${product.name}`);
    }
  }

  // ── Skills ──────────────────────────────────────────────────────────────────
  const skills: Array<{ name: string; category: string; order: number }> = [
    // Frontend
    { name: 'React', category: 'Frontend', order: 0 },
    { name: 'React Native', category: 'Frontend', order: 1 },
    { name: 'TypeScript', category: 'Frontend', order: 2 },
    { name: 'Tailwind CSS', category: 'Frontend', order: 3 },
    // Backend
    { name: 'Node.js', category: 'Backend', order: 0 },
    { name: 'NestJS', category: 'Backend', order: 1 },
    { name: 'Python', category: 'Backend', order: 2 },
    { name: 'Go', category: 'Backend', order: 3 },
    { name: 'Java', category: 'Backend', order: 4 },
    { name: 'Spring Framework', category: 'Backend', order: 5 },
    // Database
    { name: 'PostgreSQL', category: 'Database', order: 0 },
    { name: 'MongoDB', category: 'Database', order: 1 },
    { name: 'SQL', category: 'Database', order: 2 },
    // DevOps
    { name: 'Docker', category: 'DevOps', order: 0 },
    { name: 'CI/CD', category: 'DevOps', order: 1 },
    { name: 'GitLab', category: 'DevOps', order: 2 },
    { name: 'Linux', category: 'DevOps', order: 3 },
    { name: 'Bash', category: 'DevOps', order: 4 },
    // AI
    { name: 'Ollama', category: 'AI', order: 0 },
    { name: 'MCP', category: 'AI', order: 1 },
    { name: 'Agentes de IA', category: 'AI', order: 2 },
    { name: 'Machine Learning', category: 'AI', order: 3 },
    // Comms
    { name: 'Asterisk', category: 'Comms', order: 0 },
    { name: 'VoIP', category: 'Comms', order: 1 },
    { name: 'SIP', category: 'Comms', order: 2 },
  ];

  for (const skill of skills) {
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name, category: skill.category },
    });
    if (!existing) {
      await prisma.skill.create({ data: skill });
    }
  }
  console.log(`  ✓ Skills created (${skills.length})`);

  // ── Experience ──────────────────────────────────────────────────────────────
  const experiences = [
    {
      role: 'Desenvolvedor',
      company: 'Dígitro Tecnologia',
      location: 'Florianópolis, SC',
      startDate: new Date('2023-10-01T00:00:00.000Z'),
      endDate: null,
      current: true,
      description:
        'Atuação no desenvolvimento de aplicações web e sistemas, com foco em arquitetura de software e IA generativa.',
      achievements: [
        'Arquitetura de Software: micro front-ends React/React Native + Node.js',
        'IA generativa: agentes para mapeamento e implementação de features',
        'Automação Linux (Bash), empacotamento RPM/DEB',
        'CI/CD GitLab',
        'Testes em VoIP/PABX/Gateways',
      ],
      order: 0,
    },
    {
      role: 'Estágio',
      company: 'Dígitro Tecnologia',
      location: 'Florianópolis, SC',
      startDate: new Date('2022-04-01T00:00:00.000Z'),
      endDate: new Date('2023-10-01T00:00:00.000Z'),
      current: false,
      description:
        'Estágio em desenvolvimento de software com foco em Python, Linux e VoIP.',
      achievements: [
        'Python, Red Hat Linux, Shell script',
        'Asterisk, VoIP',
      ],
      order: 1,
    },
  ];

  for (const exp of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { role: exp.role, company: exp.company, startDate: exp.startDate },
    });
    if (!existing) {
      await prisma.experience.create({ data: exp });
    }
  }
  console.log(`  ✓ Experience created (${experiences.length})`);

  // ── Categories ───────────────────────────────────────────────────────────────
  const categories = [
    { name: 'Engenharia', slug: 'engenharia', color: '#2dd4bf' },
    { name: 'IA', slug: 'ia', color: '#f59e0b' },
    { name: 'Carreira', slug: 'carreira', color: '#818cf8' },
    { name: 'DevOps', slug: 'devops', color: '#34d399' },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log(`  ✓ Categories created (${categories.length})`);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
