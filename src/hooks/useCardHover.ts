import { useRef, type MouseEvent } from 'react';
import gsap from 'gsap';

/**
 * Smooth GSAP hover effect: card lifts, tilts toward the cursor,
 * and a glare follows the mouse. Call the handlers on the element.
 */
export function useCardHover<T extends HTMLElement>(opts?: {
  lift?: number;
  tilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<T>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const lift = opts?.lift ?? 8;
  const tilt = opts?.tilt ?? 8;
  const glare = opts?.glare ?? true;

  const handleEnter = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      y: -lift,
      duration: 0.4,
      ease: 'power3.out',
    });
    if (glare && glareRef.current) {
      gsap.to(glareRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  };

  const handleMove = (e: MouseEvent<T>) => {
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

    if (glare && glareRef.current) {
      gsap.to(glareRef.current, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
    if (glare && glareRef.current) {
      gsap.to(glareRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    }
  };

  const glareElement = glare ? (
    <div
      ref={glareRef}
      className="card-glare"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '180px',
        height: '180px',
        marginLeft: '-90px',
        marginTop: '-90px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: 0,
        zIndex: 1,
      }}
    />
  ) : null;

  return { ref, handleEnter, handleMove, handleLeave, glareElement };
}
