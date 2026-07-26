import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
    );

    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 50) {
        navRef.current.style.background = 'rgba(10,10,15,0.95)';
        navRef.current.style.backdropFilter = 'blur(16px)';
        navRef.current.style.borderBottomColor = 'rgba(30,30,46,0.8)';
      } else {
        navRef.current.style.background = 'transparent';
        navRef.current.style.backdropFilter = 'none';
        navRef.current.style.borderBottomColor = 'transparent';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = ['About', 'Skills', 'Experience', 'Projects', 'Contact'];

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-300"
      style={{ background: 'transparent' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-bold text-lg tracking-tight bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="gradient-text">Experienced Shopify Developer</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button key={link} onClick={() => scrollTo(link)} className="nav-link bg-transparent border-0">
              {link}
            </button>
          ))}
        </div>
        <MagneticButton
          className="btn-primary text-sm py-2 px-5"
          onClick={() => scrollTo('Contact')}
          strength={0.2}
        >
          Hire Me
        </MagneticButton>
      </div>
    </nav>
  );
}
