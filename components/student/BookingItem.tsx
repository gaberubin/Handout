import { type Booking } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

const statusClass: Record<string, string> = {
  confirmed: 'ft-stt-confirmed',
  pending: 'ft-stt-pending',
  completed: 'ft-stt-completed',
  cancelled: 'ft-stt-cancelled',
};

interface BookingItemProps {
  booking: Booking;
  showActions?: boolean;
}

export function BookingItem({ booking, showActions = false }: BookingItemProps) {
  const { icon, iconBg, name, date, time, provider, status, price } = booking;

  return (
    <div className="ft-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 15px', marginBottom: 10 }}>
      {/* Emoji tile */}
      <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, backgroundColor: iconBg }} aria-hidden="true">
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 12, color: '#7d9188', marginTop: 2 }}>{date} · {time} · {provider}</div>
        {showActions && status === 'confirmed' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="ft-btn ft-btn-o" style={{ padding: '6px 12px', fontSize: 11.5 }}>Reschedule</button>
            <button className="ft-btn" style={{ padding: '6px 12px', fontSize: 11.5, background: '#FBEDE9', color: '#C25B4E' }}>Cancel</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="ft-num" style={{ fontSize: 16, color: '#12241C' }}>{formatCurrency(price)}</div>
        <span className={`ft-stt ${statusClass[status] || 'ft-stt-completed'}`}>{status}</span>
      </div>
    </div>
  );
}
