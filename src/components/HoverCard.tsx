import { type ReactNode, type MouseEvent, useRef } from 'react';
import gsap from 'gsap';

/**
 * Wraps children with a smooth GSAP hover effect: lifts, tilts toward cursor,
 * and shows a glare that follows the mouse. Replaces the CSS card-hover class.
 */
export default function HoverCard({
  children,
  className,
  style,
  lift = 8,
  tilt = 6,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  lift?: number;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { y: -lift, duration: 0.4, ease: 'power3.out' });
    gsap.to(glareRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
  };

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(el, {
      rotationY: px * tilt,
      rotationX: -py * tilt,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out',
    });

    gsap.to(glareRef.current, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.15,
      ease: 'power2.out',
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
    });
    gsap.to(glareRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        overflow: 'hidden',
      }}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
      <div
        ref={glareRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '200px',
          marginLeft: '-100px',
          marginTop: '-100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 1,
        }}
      />
    </div>
  );
}
