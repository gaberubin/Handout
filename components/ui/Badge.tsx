type BadgeVariant='amber'|'green'|'blue'|'red'|'slate'|'navy';
const v: Record<BadgeVariant,string> = {
  amber:'pill pill-amber', green:'pill pill-green', blue:'pill pill-blue',
  red:'pill pill-red', slate:'chip', navy:'chip',
};
export function Badge({ variant='slate', children, className='' }: { variant?:BadgeVariant; children:React.ReactNode; className?:string }) {
  return <span className={`${v[variant]} ${className}`}>{children}</span>;
}
export function Chip({ children, className='' }: { children:React.ReactNode; className?:string }) {
  return <span className={`chip ${className}`}>{children}</span>;
}
export function VerifiedBadge() {
  return <span className="verified">✓ Verified</span>;
}
