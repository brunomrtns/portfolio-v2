import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, Github, Linkedin, Phone, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Reveal, SectionTransition } from '@/components/animation/reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export function Contact(): React.ReactNode {
  const { t } = useTranslation();

  const contactFormSchema = z.object({
    name: z.string().min(1, t('contact.validationNameRequired')),
    email: z.string().email(t('contact.validationEmailInvalid')),
    message: z
      .string()
      .min(1, t('contact.validationMessageRequired'))
      .max(5000, t('contact.validationMessageTooLong')),
  });

  const CONTACT_LINKS = [
    {
      icon: Github,
      label: t('contact.linkGithub'),
      href: 'https://github.com/brunomrtns',
      value: t('contact.linkGithubValue'),
    },
    {
      icon: Linkedin,
      label: t('contact.linkLinkedin'),
      href: 'https://linkedin.com/in/bruno-martinss',
      value: t('contact.linkLinkedinValue'),
    },
    {
      icon: Mail,
      label: t('contact.linkEmail'),
      href: 'mailto:brunomartinsss@gmail.com',
      value: t('contact.linkEmailValue'),
    },
    {
      icon: Phone,
      label: t('contact.linkWhatsapp'),
      href: 'https://wa.me/5548984514286',
      value: t('contact.linkWhatsappValue'),
    },
  ];

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values: ContactFormValues): Promise<void> => {
    setSubmitting(true);
    try {
      await api.contact.send(values);
      toast.success(t('contact.success'));
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('contact.error');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contato" className="relative py-24 sm:py-36">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-8 sm:mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">09</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('contact.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            {t('contact.title')}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
            {t('contact.subtitle')}
          </p>
        </Reveal>

        {/* Content grid */}
        <div className="mt-10 sm:mt-16 grid gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-8">
          {/* Left — contact links */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {CONTACT_LINKS.map((link, i) => (
              <Reveal key={link.label} delay={0.2 + i * 0.06}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="card-premium group flex h-full items-center gap-4 p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] transition-all duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:shadow-[0_0_20px_-4px_var(--color-accent-glow)]">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                      {link.label}
                    </p>
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {link.value}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
                </a>
              </Reveal>
            ))}
          </div>

          {/* Right — form */}
          <Reveal delay={0.3}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 elevation-2 sm:p-8 lg:p-10"
            >
              {/* Subtle inner glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-24 w-24 rounded-full bg-[var(--color-accent-glow)] opacity-20 blur-3xl sm:h-40 sm:w-40" />

              <div className="relative">
                <div className="mb-8 flex items-center gap-2.5">
                  <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
                    {t('contact.formTitle')}
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">{t('contact.fieldName')}</Label>
                    <Input
                      id="contact-name"
                      placeholder={t('contact.placeholderName')}
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">{t('contact.fieldEmail')}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder={t('contact.placeholderEmail')}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Label htmlFor="contact-message">{t('contact.fieldMessage')}</Label>
                  <Textarea
                    id="contact-message"
                    placeholder={t('contact.placeholderMessage')}
                    rows={6}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-400">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  className="mt-6 w-full"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t('contact.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('contact.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
