import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TypewriterText from './TypewriterText';
import HoverCard from './HoverCard';
import { useInView } from '../hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>(0.3);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      });
      gsap.fromTo(lineRef.current, { width: 0 }, {
        width: '60px', duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: lineRef.current, start: 'top 85%' },
      });
      gsap.fromTo(paraRef.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1,
        scrollTrigger: { trigger: paraRef.current, start: 'top 85%' },
      });
      gsap.fromTo(statsRef.current?.children || [], { y: 30, opacity: 0, scale: 0.95 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: statsRef.current, start: 'top 85%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '71+', label: 'Shopify Projects' },
    { value: '4+', label: 'Years Coding' },
    { value: '50+', label: 'Happy Clients' },
    { value: '3', label: 'Languages Spoken' },
  ];

  return (
    <section ref={sectionRef} id="about" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#3b82f6' }}>
              01 — About
            </span>
            <div ref={lineRef} className="section-line" />
          </div>
          <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight" style={{ minHeight: '2.5em' }}>
            <div ref={inViewRef}>
              <TypewriterText
                segments={[
                  { text: 'Building digital experiences\nthat ', className: 'text-white' },
                  { text: 'convert', className: 'gradient-text' },
                  { text: '.', className: 'text-white' },
                ]}
                speed={28}
                trigger={inView}
                startDelay={300}
                loopDelay={2000}
              />
            </div>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <p ref={paraRef} className="text-lg leading-relaxed" style={{ color: '#94a3b8' }}>
            I'm a Shopify Developer at Softvence with a track record of delivering 70+ successful
            projects. I specialize in expert customization of premium themes like Dawn, Minimog,
            and Ella — leveraging Metafields, Metaobjects, and complex SKU management to optimize
            store architecture.<br /><br />
            Beyond Shopify, I build full-stack applications with the MERN stack and craft
            immersive, animation-rich frontends with GSAP. I translate complex client ideas into
            functional, high-conversion realities.
          </p>

          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <HoverCard
                key={stat.label}
                className="p-6 rounded-xl border"
                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="text-4xl font-bold gradient-text mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: '#64748b' }}>
                  {stat.label}
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
