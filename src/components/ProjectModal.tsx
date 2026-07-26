import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, ExternalLink, Github } from 'lucide-react';

export type ProjectModalData = {
  title: string;
  description: string;
  tags: string[];
  images: string[];
  demo?: string;
  github?: string;
};

export default function ProjectModal({
  project,
  onClose,
}: {
  project: ProjectModalData;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const tl = gsap.timeline();
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    tl.fromTo(panel, { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.1)' }, '-=0.1');

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const close = () => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) {
      onClose();
      return;
    }
    gsap.timeline({ onComplete: onClose }).to(panel, { y: 30, opacity: 0, scale: 0.96, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in' });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
          style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8' }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Hero image */}
        {project.images[0] && (
          <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ height: '260px' }}>
            <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--color-card) 100%)' }}
            />
          </div>
        )}

        <div className="p-6 sm:p-8 -mt-4 relative">
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {project.title}
          </h3>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span key={tag} className="project-tag">{tag}</span>
            ))}
          </div>

          {/* Gallery of all images */}
          {project.images.length > 1 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#3b82f6' }}>
                Gallery
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.images.map((src, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                    <img src={src} alt={`${project.title} ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(project.demo || project.github) && (
            <div className="flex gap-3 pt-2">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#3b82f6' }}
                >
                  <ExternalLink size={15} /> Live Demo
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#64748b' }}
                >
                  <Github size={15} /> Code
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
