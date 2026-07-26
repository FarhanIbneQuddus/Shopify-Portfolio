import { useEffect, useState } from 'react';

export type TypewriterSegment = { text: string; className?: string };

export default function TypewriterText({
  segments,
  speed = 35,
  startDelay = 200,
  trigger = true,
  loopDelay = 2000,
}: {
  segments: TypewriterSegment[];
  speed?: number;
  startDelay?: number;
  trigger?: boolean;
  loopDelay?: number;
}) {
  const [displayed, setDisplayed] = useState<TypewriterSegment[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const allChars: { char: string; segIndex: number }[] = [];
    segments.forEach((seg, si) => {
      for (const char of seg.text) {
        allChars.push({ char, segIndex: si });
      }
    });

    let charIndex = 0;
    let timeoutId: number;
    let phase: 'typing' | 'pausing' | 'deleting' | 'restarting' = 'typing';

    setDisplayed(segments.map((s) => ({ text: '', className: s.className })));
    setDone(false);

    const tick = () => {
      if (phase === 'typing') {
        if (charIndex < allChars.length) {
          const { char, segIndex } = allChars[charIndex];
          setDisplayed((prev) => {
            const next = [...prev];
            next[segIndex] = { ...next[segIndex], text: next[segIndex].text + char };
            return next;
          });
          charIndex++;
          timeoutId = window.setTimeout(tick, speed);
        } else {
          setDone(true);
          phase = 'pausing';
          timeoutId = window.setTimeout(tick, loopDelay);
        }
      } else if (phase === 'pausing') {
        setDone(false);
        phase = 'deleting';
        timeoutId = window.setTimeout(tick, speed);
      } else if (phase === 'deleting') {
        if (charIndex > 0) {
          charIndex--;
          const { segIndex } = allChars[charIndex];
          setDisplayed((prev) => {
            const next = [...prev];
            const cur = next[segIndex].text;
            next[segIndex] = { ...next[segIndex], text: cur.slice(0, -1) };
            return next;
          });
          timeoutId = window.setTimeout(tick, speed / 1.5);
        } else {
          phase = 'restarting';
          timeoutId = window.setTimeout(tick, startDelay);
        }
      } else {
        phase = 'typing';
        timeoutId = window.setTimeout(tick, speed);
      }
    };

    timeoutId = window.setTimeout(tick, startDelay);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <>
      {displayed.map((seg, i) => (
        <span key={i} className={seg.className}>
          {seg.text.split('\n').map((line, li, arr) => (
            <span key={li}>
              {line}
              {li < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      ))}
      <span className="typed-cursor">|</span>
    </>
  );
}
