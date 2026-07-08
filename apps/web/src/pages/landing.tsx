import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { SectionRail } from '@/components/section-rail';
import { Hero } from '@/sections/hero';
import { Brand } from '@/sections/brand';
import { About } from '@/sections/about';
import { Solutions } from '@/sections/solutions';
import { Products } from '@/sections/products';
import { Experience } from '@/sections/experience';
import { Stack } from '@/sections/stack';
import { PortfolioAbout } from '@/sections/portfolio-about';
import { Principles } from '@/sections/principles';
import { Contact } from '@/sections/contact';
import { Footer } from '@/sections/footer';

export default function LandingPage(): React.ReactNode {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t('meta.title');
  }, [t]);

  return (
    <>
      <Navbar />
      <SectionRail />
      <main>
        <Hero />
        <Brand />
        <About />
        <Solutions />
        <Products />
        <Experience />
        <Stack />
        <PortfolioAbout />
        <Principles />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
