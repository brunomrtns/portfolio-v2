import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, Github, Linkedin, Phone } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Reveal } from '@/components/animation/reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(5000, 'Mensagem muito longa'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CONTACT_LINKS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/brunomrtns',
    value: '@brunomrtns',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/bruno-martinss',
    value: 'bruno-martinss',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:brunomartinsss@gmail.com',
    value: 'brunomartinsss@gmail.com',
  },
  {
    icon: Phone,
    label: 'WhatsApp',
    href: 'https://wa.me/5548984514286',
    value: '+55 48 98451-4286',
  },
];

export function Contact(): React.ReactNode {
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
      toast.success('Mensagem enviada! Entrarei em contato em breve.');
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contato" className="relative py-32">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="mesh-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">05</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              Contato
            </span>
          </div>
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left — heading + links */}
          <div>
            <Reveal>
              <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
                Vamos <span className="gradient-text-accent">conversar</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-lg text-[var(--color-text-secondary)]">
                Tem um projeto em mente ou quer saber mais sobre algum produto?
                Me envie uma mensagem — respondo rapidamente.
              </p>
            </Reveal>

            <div className="mt-12 space-y-3">
              {CONTACT_LINKS.map((link, i) => (
                <Reveal key={link.label} delay={0.2 + i * 0.08}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all duration-300 hover:border-[var(--color-border-bright)] hover:elevation-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] transition-colors duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-white">
                      <link.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                        {link.label}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {link.value}
                      </p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <Reveal delay={0.3}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 elevation-2"
            >
              <div className="mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Enviar mensagem
                </h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nome</Label>
                  <Input
                    id="contact-name"
                    placeholder="Seu nome"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Mensagem</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Conte sobre seu projeto ou pergunta..."
                    rows={5}
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
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar mensagem
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
