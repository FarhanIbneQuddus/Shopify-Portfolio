import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skills } from '../data/portfolio';
import TypewriterText from './TypewriterText';
import HoverCard from './HoverCard';
import { useInView } from '../hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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

      const cards = gridRef.current?.querySelectorAll('.skill-card') || [];
      cards.forEach((card, i) => {
        gsap.fromTo(card, { y: 40, opacity: 0, scale: 0.97 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)', delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 88%' },
        });

        const fill = card.querySelector('.skill-bar-fill');
        if (fill) {
          gsap.to(fill, {
            scaleX: (skills[i].level / 100),
            duration: 1.4,
            ease: 'power3.out',
            delay: 0.3,
            scrollTrigger: { trigger: card, start: 'top 85%' },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#3b82f6' }}>
              02 — Skills
            </span>
            <div ref={lineRef} className="section-line" />
          </div>
          <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold tracking-tight" style={{ minHeight: '1.2em' }}>
            <div ref={inViewRef}>
              <TypewriterText
                segments={[
                  { text: 'Technical ', className: 'text-white' },
                  { text: 'arsenal', className: 'gradient-text' },
                ]}
                speed={35}
                trigger={inView}
                startDelay={300}
                loopDelay={2000}
              />
            </div>
          </h2>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-5">
          {skills.map((skill) => (
            <HoverCard
              key={skill.category}
              className="skill-card p-6 rounded-xl border"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {skill.category}
                </h3>
                <span className="text-sm font-bold gradient-text">{skill.level}%</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.items.map((item) => (
                  <span key={item} className="project-tag">{item}</span>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div
                  className="skill-bar-fill"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', width: '100%' }}
                />
              </div>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
}
