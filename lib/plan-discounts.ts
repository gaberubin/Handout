/**
 * Plan-based discount rules for Handout.
 * Import `applyDiscount` wherever a price is displayed or saved.
 */

export type UserPlan = 'free' | 'plus' | 'pro';

/** Discount rates by plan and service type */
export const DISCOUNT_RULES: Record<UserPlan, { services: number; tiffin: number }> = {
  free: { services: 0,    tiffin: 0    },
  plus: { services: 0,    tiffin: 0    },
  pro:  { services: 0.10, tiffin: 0.15 },
};

export type DiscountType = 'services' | 'tiffin';

/**
 * Returns the discounted price and savings amount.
 * @param originalPrice  numeric price (e.g. 25)
 * @param plan           user's current plan
 * @param type           'services' or 'tiffin'
 */
export function applyDiscount(
  originalPrice: number,
  plan: UserPlan,
  type: DiscountType
): { discounted: number; saved: number; pct: number } {
  const pct = DISCOUNT_RULES[plan]?.[type] ?? 0;
  const saved = Math.round(originalPrice * pct * 100) / 100;
  return {
    discounted: Math.round((originalPrice - saved) * 100) / 100,
    saved,
    pct,
  };
}

/** Parse "Est. $25" or "$25/hr" → 25 */
export function parsePrice(raw: string): number {
  const match = raw.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/** Format back to display string, preserving unit suffix */
export function formatPrice(amount: number, suffix = ''): string {
  return `$${amount % 1 === 0 ? amount : amount.toFixed(2)}${suffix}`;
}

/** Fetch current user's plan from Supabase (client-side) */
export async function fetchUserPlan(): Promise<UserPlan> {
  // Dynamic import so this file stays importable in server components too
  const { createClient } = await import('@/lib/supabase/client');
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return 'free';
  const { data } = await sb.from('users').select('plan').eq('id', user.id).single();
  return (data?.plan as UserPlan) || 'free';
}
