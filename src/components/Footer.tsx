import { personalInfo } from '../data/portfolio';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm" style={{ color: '#64748b' }}>
          © {year} {personalInfo.name}. | All Rights Reserved
        </div>
        <div className="flex items-center gap-5">
          <a href={`mailto:${personalInfo.email}`} className="transition-colors hover:text-blue-400" style={{ color: '#64748b' }} aria-label="Email">
            <Mail size={18} />
          </a>
          <a href={personalInfo.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-400" style={{ color: '#64748b' }} aria-label="GitHub">
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
