import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Showcase from '@/components/landing/Showcase';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060d1a] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Showcase />
      <CTA />
      <Footer />
    </main>
  );
}
