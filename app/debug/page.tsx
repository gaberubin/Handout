import { notFound } from 'next/navigation';
import { DebugChecks } from './DebugChecks';

// Local troubleshooting only (see READ_ME_FIRST.md); production builds render the not-found page.
export default function DebugPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DebugChecks />;
}
