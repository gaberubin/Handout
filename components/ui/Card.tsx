import { ReactNode } from 'react';

export function Card({ children, className='' }: { children:ReactNode; className?:string }) {
  return <div className={`card ${className}`}>{children}</div>;
}
export function CardHeader({ title, action }: { title:ReactNode; action?:ReactNode }) {
  return (
    <div className="card-header">
      <div className="card-header-title">{title}</div>
      {action && <div>{action}</div>}
    </div>
  );
}
interface StatCardProps { label:string; value:string|number; sub?:string; icon:ReactNode; iconColor?:string; }
export function StatCard({ label, value, sub, icon, iconColor='rgba(18,161,80,0.15)' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background:iconColor }}>{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
