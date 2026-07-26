import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalInfo } from '../data/portfolio';
import { ArrowDown, Github, Mail, MapPin } from 'lucide-react';
import MagneticButton from './MagneticButton';
import TypewriterText from './TypewriterText';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageBorderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll('.hero-particle');
      gsap.set(particles, { opacity: 0, scale: 0 });
      tl.to(particles, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0);
    }

    tl.fromTo(
      titleRef.current,
      { y: 60, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
      { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.out' },
      0.2
    )
    .fromTo(
      subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      0.6
    )
    .fromTo(
      taglineRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      0.85
    )
    .fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      1.05
    )
    .fromTo(
      metaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      1.2
    )
    .fromTo(
      scrollRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      1.4
    );

    tl.fromTo(
      imageWrapRef.current,
      { scale: 0.8, opacity: 0, rotationY: -15 },
      { scale: 1, opacity: 1, rotationY: 0, duration: 1.2, ease: 'power3.out' },
      0.4
    );
    tl.fromTo(
      imageBorderRef.current,
      { scale: 1.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
      0.5
    );

    gsap.to('.hero-glow', {
      scale: 1.15,
      opacity: 0.6,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const st = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
      gsap.to(imageWrapRef.current, {
        yPercent: -8,
        rotation: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
      gsap.to(contentRef.current, {
        yPercent: -12,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => {
      st.revert();
    };
  }, []);

  const scrollDown = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="hero-glow absolute rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          top: '10%',
          left: '60%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="hero-glow absolute rounded-full pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          bottom: '20%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
      />

      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="hero-particle float-anim"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? 'rgba(59,130,246,0.5)' : 'rgba(6,182,212,0.5)',
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 90 + 5}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 4 + 5}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={contentRef} className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border"
                style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)' }}
              >
                Available for Work
              </span>
            </div>

            <h1
              ref={titleRef}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-none tracking-tight"
            >
              {personalInfo.name.split(' ').map((word, i) => (
                <span key={i} className={i === 0 ? 'block text-white' : i === 1 ? 'block gradient-text' : 'block text-white'}>
                  {word}
                </span>
              ))}
            </h1>

            <p ref={subtitleRef} className="text-xl font-semibold mb-4" style={{ color: '#94a3b8', minHeight: '1.5em' }}>
              <TypewriterText
                segments={[{ text: personalInfo.role }]}
                speed={45}
                startDelay={900}
                loopDelay={2000}
              />
            </p>

            <p ref={taglineRef} className="text-base leading-relaxed mb-10 max-w-xl" style={{ color: '#64748b' }}>
              {personalInfo.tagline}
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 mb-10">
              <MagneticButton
                className="btn-primary"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Projects
              </MagneticButton>
              <MagneticButton
                className="btn-outline"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get In Touch
              </MagneticButton>
            </div>

            <div ref={metaRef} className="flex flex-wrap gap-6">
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 text-sm transition-colors hover:text-blue-400" style={{ color: '#64748b' }}>
                <Mail size={14} />
                {personalInfo.email}
              </a>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                <MapPin size={14} />
                {personalInfo.location}
              </span>
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm transition-colors hover:text-blue-400" style={{ color: '#64748b' }}>
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>

          <div ref={imageWrapRef} className="relative flex justify-center md:justify-end">
            <div className="relative" style={{ width: 'min(380px, 80vw)', height: 'min(380px, 80vw)' }}>
              <div
                ref={imageBorderRef}
                className="absolute -inset-4 rounded-full opacity-70"
                style={{
                  background: 'conic-gradient(from 0deg, #3b82f6, #06b6d4, #3b82f6)',
                  filter: 'blur(20px)',
                }}
              />
              <div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{
                  border: '1px dashed rgba(59,130,246,0.3)',
                  animation: 'spin 20s linear infinite',
                }}
              />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <img
                  ref={imageRef}
                  src={personalInfo.image}
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                  style={{ willChange: 'transform' }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(10,10,15,0.4) 100%)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        ref={scrollRef}
        onClick={scrollDown}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity hover:opacity-70"
        style={{ color: '#475569' }}
        aria-label="Scroll down"
      >
        <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </section>
  );
}
