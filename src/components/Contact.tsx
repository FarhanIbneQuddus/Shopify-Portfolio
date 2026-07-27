import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalInfo } from '../data/portfolio';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Github, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import TypewriterText from './TypewriterText';
import MagneticButton from './MagneticButton';
import HoverCard from './HoverCard';
import { useInView } from '../hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>(0.3);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
      gsap.fromTo(formRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: formRef.current, start: 'top 85%' },
      });
      gsap.fromTo(infoRef.current, { x: 40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: infoRef.current, start: 'top 85%' },
      });

      const inputs = formRef.current?.querySelectorAll('.contact-input');
      if (inputs) {
        gsap.fromTo(inputs, { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2,
          scrollTrigger: { trigger: formRef.current, start: 'top 85%' },
        });
      }

      const infoCards = infoRef.current?.querySelectorAll('.info-card');
      if (infoCards) {
        gsap.fromTo(infoCards, { x: 30, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2,
          scrollTrigger: { trigger: infoRef.current, start: 'top 85%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;
      const apiHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        apiHeaders['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        throw new Error('Saved, but email notification failed. Please check back later.');
      }

      const data = await res.json();
      if (data?.error) {
        throw new Error('Saved, but email notification failed. Please check back later.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: personalInfo.email, href: `mailto:${personalInfo.email}` },
    { icon: Phone, label: 'Phone', value: personalInfo.phone, href: `tel:${personalInfo.phone}` },
    { icon: MapPin, label: 'Location', value: personalInfo.location, href: null },
    { icon: Github, label: 'GitHub', value: '@FarhanIbneQuddus', href: personalInfo.github },
  ];

  return (
    <section ref={sectionRef} id="contact" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#3b82f6' }}>
              05 — Contact
            </span>
            <div ref={lineRef} className="section-line" />
          </div>
          <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold tracking-tight" style={{ minHeight: '1.2em' }}>
            <div ref={inViewRef}>
              <TypewriterText
                segments={[
                  { text: "Let's ", className: 'text-white' },
                  { text: 'connect', className: 'gradient-text' },
                ]}
                speed={35}
                trigger={inView}
                startDelay={300}
                loopDelay={2000}
              />
            </div>
          </h2>
          <p className="mt-4 text-base max-w-xl" style={{ color: '#64748b' }}>
            Have a project in mind or just want to say hi? Drop me a message and I'll get back to you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="contact-input"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="contact-input"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project..."
                rows={5}
                className="contact-input resize-none"
                disabled={status === 'loading'}
              />
            </div>

            <MagneticButton
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={() => formRef.current?.requestSubmit()}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </MagneticButton>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                <CheckCircle2 size={16} />
                Message sent! I'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}
          </form>

          <div ref={infoRef} className="space-y-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <HoverCard
                  className="info-card flex items-center gap-4 p-5 rounded-xl border"
                  style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <Icon size={18} style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs tracking-widest uppercase mb-1" style={{ color: '#64748b' }}>
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {item.value}
                    </div>
                  </div>
                </HoverCard>
              );
              return item.href ? (
                <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        </div>
        <HoverCard
              className="info-card p-5 rounded-xl border"
              style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)', marginTop: '40px' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                Currently available for freelance work and full-time opportunities. Whether it's a
                Shopify store customization or a full-stack build, let's make it happen.
              </p>
            </HoverCard>
      </div>
    </section>
  );
}
