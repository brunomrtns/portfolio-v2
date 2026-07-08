import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/sections/hero';
import { About } from '@/sections/about';
import { Products } from '@/sections/products';
import { Stack } from '@/sections/stack';
import { Experience } from '@/sections/experience';
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
      <main>
        <Hero />
        <About />
        <Products />
        <Stack />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
