import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalProjects, clientStores } from '../data/portfolio';
import { Star } from 'lucide-react';
import TypewriterText from './TypewriterText';
import HoverCard from './HoverCard';
import ProjectModal, { type ProjectModalData } from './ProjectModal';
import { useInView } from '../hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>(0.3);
  const [activeProject, setActiveProject] = useState<ProjectModalData | null>(null);

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

      const cards = projectsRef.current?.querySelectorAll('.project-card') || [];
      cards.forEach((card, i) => {
        gsap.fromTo(card, { y: 60, opacity: 0, scale: 0.97 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.1)', delay: (i % 2) * 0.1,
          scrollTrigger: { trigger: card, start: 'top 88%' },
        });
      });

      // Seamless infinite vertical loop for each single-image track.
      // The track holds two copies of the same image; we scroll up by one
      // copy's height and repeat, so the loop reads as one long screenshot.
      const tracks = [
        ...(projectsRef.current?.querySelectorAll<HTMLElement>('.img-loop-track') || []),
        ...(storesRef.current?.querySelectorAll<HTMLElement>('.img-loop-track') || []),
      ];

      const setupTrack = (track: HTMLElement) => {
        const first = track.firstElementChild as HTMLElement | null;
        if (!first) return;
        const h = first.offsetHeight;
        if (h <= 0) return;
        gsap.to(track, {
          y: -h,
          duration: Math.max(10, h / 45),
          repeat: -1,
          ease: 'none',
        });
      };

      tracks.forEach((track) => {
        const img = track.querySelector('img');
        if (img && img.complete && img.naturalHeight > 0) {
          setupTrack(track);
        } else if (img) {
          img.addEventListener('load', () => setupTrack(track), { once: true });
        }
      });

      const storeCards = storesRef.current?.querySelectorAll('.store-card') || [];
      gsap.fromTo(storeCards, { y: 30, opacity: 0, scale: 0.96 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: storesRef.current, start: 'top 90%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const renderLoop = (src: string, alt: string, height: number) => (
    <div className="relative overflow-hidden" style={{ height }}>
      <div className="img-loop-track absolute top-0 left-0 w-full" style={{ willChange: 'transform' }}>
        <img src={src} alt={alt} className="w-full block" style={{ height: 'auto' }} loading="lazy" />
        <img src={src} alt="" aria-hidden="true" className="w-full block" style={{ height: 'auto' }} loading="lazy" />
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} id="projects" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#3b82f6' }}>
              04 — Projects
            </span>
            <div ref={lineRef} className="section-line" />
          </div>
          <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold tracking-tight" style={{ minHeight: '1.2em' }}>
            <div ref={inViewRef}>
              <TypewriterText
                segments={[
                  { text: "Things I've ", className: 'text-white' },
                  { text: 'built', className: 'gradient-text' },
                ]}
                speed={35}
                trigger={inView}
                startDelay={300}
                loopDelay={2000}
              />
            </div>
          </h2>
        </div>

        <div ref={projectsRef} className="grid md:grid-cols-2 gap-6 mb-20">
          {personalProjects.map((project) => (
            <HoverCard
              key={project.title}
              className="project-card group rounded-2xl border cursor-pointer"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div onClick={() => setActiveProject(project)}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 flex-shrink-0 overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                    {renderLoop(project.images[0], project.title, 220)}
                  </div>

                  <div className="p-6 flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {project.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="project-tag">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: '#3b82f6' }}>
                      Click to view details →
                    </span>
                  </div>
                </div>
              </div>
            </HoverCard>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Star size={18} style={{ color: '#3b82f6' }} />
            Selected Shopify Client Stores
          </h3>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            A snapshot of the 70+ Shopify stores I've helped build and customize.
          </p>
        </div>

        <div ref={storesRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {clientStores.map((store) => (
            <HoverCard
              key={store.name}
              className="store-card group rounded-2xl border cursor-pointer overflow-hidden"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div onClick={() => setActiveProject({ ...store, title: store.name, demo: store.url })}>
                {renderLoop(store.images[0], store.name, 180)}

                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {store.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                      {store.type}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>
                    {store.description}
                  </p>
                </div>
              </div>
            </HoverCard>
          ))}
        </div>
      </div>

      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </section>
  );
}
