type AvatarColor='amber'|'blue'|'green'|'rose'|'violet'|'teal'|'navy';
type AvatarSize='sm'|'md'|'lg'|'xl';
const colors: Record<AvatarColor,{bg:string;fg:string}> = {
  amber:  { bg:'#12A150', fg:'#ffffff' },
  blue:   { bg:'#12A150', fg:'#fff' },
  green:  { bg:'#12A150', fg:'#fff' },
  rose:   { bg:'#E11D48', fg:'#fff' },
  violet: { bg:'#7C3AED', fg:'#fff' },
  teal:   { bg:'#0891B2', fg:'#fff' },
  navy:   { bg:'#FFFFFF', fg:'#fff' },
};
export function Avatar({ initials, color='amber', size='md', className='' }: { initials:string; color?:AvatarColor; size?:AvatarSize; className?:string }) {
  const { bg, fg } = colors[color];
  return (
    <div className={`avatar avatar-${size} ${className}`} style={{ background:bg, color:fg }} aria-hidden>
      {initials}
    </div>
  );
}
