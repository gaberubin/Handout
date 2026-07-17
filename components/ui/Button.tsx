'use client';
import Link, { type LinkProps } from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type BtnVariant = 'primary'|'dark'|'outline'|'ghost'|'danger'|'green'|'navy';
export type BtnSize = 'sm'|'md'|'lg'|'xl';

function cls(v: BtnVariant, s: BtnSize, full?: boolean, extra?: string) {
  return `btn btn-${v} btn-${s}${full?' btn-full':''}${extra?' '+extra:''}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant; size?: BtnSize; fullWidth?: boolean; loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant='outline', size='md', fullWidth, loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled||loading} className={cls(variant,size,fullWidth,className)} {...props}>
      {loading ? <span style={{ display:'inline-block', width:14, height:14, border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite' }} /> : children}
    </button>
  )
);
Button.displayName = 'Button';

interface LinkButtonProps extends LinkProps {
  variant?: BtnVariant; size?: BtnSize; fullWidth?: boolean; className?: string; children: React.ReactNode;
}
export function LinkButton({ variant='outline', size='md', fullWidth, className, children, ...props }: LinkButtonProps) {
  return <Link className={cls(variant,size,fullWidth,className)} {...props}>{children}</Link>;
}
