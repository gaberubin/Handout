'use client';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export function Field({ label, error, required, children, className='' }: { label:string; error?:string; required?:boolean; children:React.ReactNode; className?:string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="field-label">{label}{required && <span style={{color:'var(--red)',marginLeft:2}}>*</span>}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>&{error?:boolean}>(
  ({error,className='',style,...props},ref) => (
    <input ref={ref} className={`field-input${error?' error':''} ${className}`} style={style} {...props}/>
  )
);
Input.displayName='Input';
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>&{error?:boolean}>(
  ({error,className='',children,...props},ref) => (
    <select ref={ref} className={`field-select${error?' error':''} ${className}`} {...props}>{children}</select>
  )
);
Select.displayName='Select';
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>&{error?:boolean}>(
  ({error,className='',...props},ref) => (
    <textarea ref={ref} className={`field-textarea${error?' error':''} ${className}`} {...props}/>
  )
);
Textarea.displayName='Textarea';
export function ProgressBar({ value, className='' }: { value:number; className?:string }) {
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-fill" style={{ width:`${Math.min(100,Math.max(0,value))}%` }}/>
    </div>
  );
}
