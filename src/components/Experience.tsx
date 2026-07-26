import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience, education, awards, languages } from '../data/portfolio';
import TypewriterText from './TypewriterText';
import HoverCard from './HoverCard';
import { useInView } from '../hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);
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

      const items = timelineRef.current?.querySelectorAll('.timeline-item') || [];
      items.forEach((item) => {
        gsap.fromTo(item, { x: -40, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%' },
        });
        const highlights = item.querySelectorAll('.timeline-highlight');
        gsap.fromTo(highlights, { x: -20, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 80%' },
        });
      });

      const extraCards = extraRef.current?.children || [];
      gsap.fromTo(extraCards, { y: 40, opacity: 0, scale: 0.97 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: extraRef.current, start: 'top 85%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#3b82f6' }}>
              03 — Experience
            </span>
            <div ref={lineRef} className="section-line" />
          </div>
          <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold tracking-tight" style={{ minHeight: '1.2em' }}>
            <div ref={inViewRef}>
              <TypewriterText
                segments={[
                  { text: 'The ', className: 'text-white' },
                  { text: 'journey', className: 'gradient-text' },
                ]}
                speed={35}
                trigger={inView}
                startDelay={300}
                loopDelay={2000}
              />
            </div>
          </h2>
        </div>

        <div ref={timelineRef} className="mb-20">
          {experience.map((exp, i) => (
            <div key={i} className="timeline-item flex gap-5 mb-12">
              <div className="flex flex-col items-center pt-2">
                <div className="timeline-dot" />
                <div className="w-px flex-1 mt-2" style={{ background: 'var(--color-border)' }} />
              </div>
              <div className="flex-1 pb-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {exp.role}
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                  {exp.company} · {exp.location}
                </p>
                <ul className="space-y-2">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="timeline-highlight text-sm leading-relaxed flex gap-2" style={{ color: '#94a3b8' }}>
                      <span style={{ color: '#3b82f6' }}>▸</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div ref={extraRef} className="grid md:grid-cols-3 gap-5">
          <HoverCard className="p-6 rounded-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: '#3b82f6' }}>
              Education
            </h3>
            <div className="space-y-5">
              {education.map((ed, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {ed.degree}
                  </div>
                  <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>{ed.institution} · {ed.location}</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>{ed.period}</div>
                  <div className="text-xs mt-1" style={{ color: '#64748b' }}>{ed.detail}</div>
                </div>
              ))}
            </div>
          </HoverCard>

          <HoverCard className="p-6 rounded-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: '#3b82f6' }}>
              Awards
            </h3>
            <div className="space-y-4">
              {awards.map((a, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {a.title}
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>{a.org}</div>
                </div>
              ))}
            </div>
          </HoverCard>

          <HoverCard className="p-6 rounded-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: '#3b82f6' }}>
              Languages
            </h3>
            <div className="space-y-4">
              {languages.map((l, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {l.lang}
                  </span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{l.level}</span>
                </div>
              ))}
            </div>
          </HoverCard>
        </div>
      </div>
    </section>
  );
}
