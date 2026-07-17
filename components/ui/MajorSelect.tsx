'use client';
import { useState, useRef, useEffect } from 'react';

const MAJORS = [
  // UNDERGRADUATE
  'UG • Computer Science',
  'UG • Software Engineering',
  'UG • Information Technology',
  'UG • Data Science',
  'UG • Artificial Intelligence',
  'UG • Cybersecurity',
  'UG • Computer Engineering',
  'UG • Electrical Engineering',
  'UG • Electronics & Communication',
  'UG • Mechanical Engineering',
  'UG • Civil Engineering',
  'UG • Chemical Engineering',
  'UG • Biomedical Engineering',
  'UG • Aerospace Engineering',
  'UG • Industrial Engineering',
  'UG • Environmental Engineering',
  'UG • Robotics Engineering',
  'UG • B.Tech Computer Science (Indian)',
  'UG • B.Tech Mechanical (Indian)',
  'UG • BCA - Computer Applications',
  'UG • Business Administration',
  'UG • Finance',
  'UG • Accounting',
  'UG • Marketing',
  'UG • Management',
  'UG • Economics',
  'UG • International Business',
  'UG • Entrepreneurship',
  'UG • Supply Chain Management',
  'UG • Hospitality Management',
  'UG • Sports Management',
  'UG • BBA (Indian)',
  'UG • B.Com (Indian)',
  'UG • Biology',
  'UG • Chemistry',
  'UG • Physics',
  'UG • Mathematics',
  'UG • Statistics',
  'UG • Biochemistry',
  'UG • Microbiology',
  'UG • Neuroscience',
  'UG • Environmental Science',
  'UG • Nursing',
  'UG • Pre-Med',
  'UG • Pre-Dental',
  'UG • Public Health',
  'UG • Kinesiology',
  'UG • Nutrition & Dietetics',
  'UG • Psychology',
  'UG • Sociology',
  'UG • Political Science',
  'UG • International Relations',
  'UG • Criminal Justice',
  'UG • Social Work',
  'UG • Education',
  'UG • English Literature',
  'UG • History',
  'UG • Philosophy',
  'UG • Linguistics',
  'UG • Graphic Design',
  'UG • Fine Arts',
  'UG • Architecture',
  'UG • Interior Design',
  'UG • Fashion Design',
  'UG • Music',
  'UG • Theatre',
  'UG • Film & Media',
  'UG • Animation',
  'UG • Game Design',
  'UG • Communications',
  'UG • Journalism',
  'UG • Pre-Law',
  // POSTGRADUATE
  'PG • M.S. Computer Science',
  'PG • M.S. Data Science',
  'PG • M.S. Artificial Intelligence',
  'PG • M.S. Cybersecurity',
  'PG • M.S. Software Engineering',
  'PG • M.S. Information Systems',
  'PG • M.S. Electrical Engineering',
  'PG • M.S. Mechanical Engineering',
  'PG • M.S. Civil Engineering',
  'PG • M.S. Chemical Engineering',
  'PG • M.S. Biomedical Engineering',
  'PG • M.S. Aerospace Engineering',
  'PG • M.Tech (Indian)',
  'PG • MCA - Computer Applications',
  'PG • MBA - Business Administration',
  'PG • M.S. Finance',
  'PG • M.S. Marketing',
  'PG • M.S. Business Analytics',
  'PG • M.S. Management',
  'PG • M.S. Supply Chain',
  'PG • M.Com (Indian)',
  'PG • M.S. Biology',
  'PG • M.S. Chemistry',
  'PG • M.S. Physics',
  'PG • M.S. Mathematics',
  'PG • M.S. Statistics',
  'PG • M.S. Biotechnology',
  'PG • M.Sc (Indian)',
  'PG • MD - Doctor of Medicine',
  'PG • DDS - Dentistry',
  'PG • PharmD - Pharmacy',
  'PG • MPH - Public Health',
  'PG • MSN - Nursing',
  'PG • DPT - Physical Therapy',
  'PG • M.S. Psychology',
  'PG • M.S. Clinical Psychology',
  'PG • MSW - Social Work',
  'PG • M.Ed - Education',
  'PG • M.A. English',
  'PG • M.A. History',
  'PG • M.A. Economics',
  'PG • M.A. Communications',
  'PG • M.A (Indian)',
  'PG • JD - Law',
  'PG • LLM - Master of Laws',
  'PG • M.Arch - Architecture',
  'PG • MFA - Fine Arts',
  // PHD
  'PhD • Computer Science',
  'PhD • Engineering',
  'PhD • Mathematics',
  'PhD • Physics',
  'PhD • Chemistry',
  'PhD • Biology',
  'PhD • Psychology',
  'PhD • Economics',
  'PhD • Education',
  'PhD • Business',
  'PhD • Humanities',
  'Other / Undecided',
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MajorSelect({ value, onChange, disabled, placeholder = 'Start typing your major…' }: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.length === 0
    ? MAJORS.slice(0, 10)
    : MAJORS.filter(m => m.toLowerCase().includes(value.toLowerCase())).slice(0, 12);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectItem(major: string) {
    onChange(major);
    setOpen(false);
    setHighlight(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlight]) {
      e.preventDefault();
      selectItem(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function badgeColor(level: string) {
    if (level.startsWith('UG')) return { bg: 'rgba(37,99,235,0.15)', fg: '#60A5FA' };
    if (level.startsWith('PG')) return { bg: 'rgba(18,161,80,0.15)', fg: '#12A150' };
    if (level.startsWith('PhD')) return { bg: 'rgba(124,58,237,0.15)', fg: '#7C6BD1' };
    return { bg: 'rgba(90,100,120,0.15)', fg: '#4c6157' };
  }

  function renderItem(item: string, isHighlighted: boolean) {
    const parts = item.split(' • ');
    if (parts.length === 2) {
      const colors = badgeColor(parts[0]);
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: colors.bg,
            color: colors.fg,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            padding: '2px 7px',
            borderRadius: 4,
            minWidth: 28,
            textAlign: 'center',
          }}>
            {parts[0]}
          </span>
          <span style={{ color: isHighlighted ? 'var(--amber)' : 'var(--white)' }}>{parts[1]}</span>
        </div>
      );
    }
    return <span>{item}</span>;
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="field-input"
        autoComplete="off"
      />

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--navy2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          maxHeight: 320,
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}>
          {filtered.map((major, i) => (
            <div
              key={major}
              onMouseDown={(e) => { e.preventDefault(); selectItem(major); }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                background: i === highlight ? 'rgba(18,161,80,0.08)' : 'transparent',
                fontSize: 14,
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(18,36,28,0.04)' : 'none',
              }}
            >
              {renderItem(major, i === highlight)}
            </div>
          ))}
        </div>
      )}

      {open && value.length > 0 && filtered.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--navy2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '14px',
          zIndex: 50,
          fontSize: 13,
          color: 'var(--muted)',
        }}>
          No match. <span style={{ color: 'var(--amber)' }}>"{value}"</span> will be saved as your major.
        </div>
      )}
    </div>
  );
}