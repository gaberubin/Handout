import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--navy)',
      padding: '40px 32px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'var(--amber)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 16, color: '#ffffff' }}>H</div>
              <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--white)' }}>Handout</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 280, lineHeight: 1.5 }}>
              Your home away from home. Built for students at Rowan University and beyond.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>

            <FooterCol title="Company">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
            </FooterCol>

            <FooterCol title="Legal">
              <FooterLink href="/legal/terms">Terms of Service</FooterLink>
              <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/legal/safety">Safety &amp; Trust</FooterLink>
            </FooterCol>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 12,
          color: 'var(--muted)',
        }}>
          <div>© 2026 Handout. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/legal/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms</Link>
            <Link href="/legal/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/legal/safety" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Safety</Link>
            <span>Made with 💚 at Rowan University</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}