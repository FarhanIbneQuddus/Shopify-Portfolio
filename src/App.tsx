import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cursor glow that follows mouse
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      gsap.to(glowRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power2.out',
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Refresh ScrollTrigger after fonts/images load so positions are accurate
    const refreshST = () => ScrollTrigger.refresh();
    window.addEventListener('load', refreshST);
    window.addEventListener('resize', refreshST);
    const refreshTimeout = window.setTimeout(refreshST, 500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('load', refreshST);
      window.removeEventListener('resize', refreshST);
      window.clearTimeout(refreshTimeout);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div ref={glowRef} className="cursor-glow" />
      <div className="noise-overlay" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
