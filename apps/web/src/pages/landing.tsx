import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/sections/hero';
import { About } from '@/sections/about';
import { Products } from '@/sections/products';
import { Stack } from '@/sections/stack';
import { Experience } from '@/sections/experience';
import { Contact } from '@/sections/contact';
import { Footer } from '@/sections/footer';

export default function LandingPage(): React.ReactNode {
  useEffect(() => {
    document.title = 'Bruno Integrations — Engenharia de software com precisão e propósito';
  }, []);

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
