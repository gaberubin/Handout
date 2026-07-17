'use client';
import { AuthGateProvider } from '@/components/auth/AuthGate';
import { CartProvider } from '@/lib/cart-store';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AuthGateProvider>{children}</AuthGateProvider>
    </CartProvider>
  );
}
