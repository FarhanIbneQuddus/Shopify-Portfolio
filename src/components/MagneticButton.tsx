import { useRef, type ReactNode, type MouseEvent } from 'react';
import gsap from 'gsap';

export default function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  const handleClick = () => {
    if (!ref.current) return;
    gsap.timeline()
      .to(ref.current, { scale: 0.95, duration: 0.08, ease: 'power2.in' })
      .to(ref.current, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
    onClick?.();
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}
