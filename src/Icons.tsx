export type IconName =
  | 'close'
  | 'sound'
  | 'muted'
  | 'menu'
  | 'eye'
  | 'book'
  | 'hint'
  | 'back'
  | 'reset'
  | 'check'
  | 'expand'
  | 'arrow';
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    close: 'M6 6l12 12M18 6L6 18',
    sound: 'M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8M19 5q8 7 0 14',
    muted: 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
    menu: 'M5 7h14M5 12h14M5 17h14',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    book: 'M12 5q-6-3-9 0v15q4-3 9 0 5-3 9 0V5q-3-3-9 0v15',
    hint: 'M9 18h6M10 21h4M9 15c0-2-4-4-4-7a7 7 0 0 1 14 0c0 3-4 5-4 7z',
    back: 'M15 5l-7 7 7 7',
    reset: 'M4 11a8 8 0 1 1 1 5M4 4v7h7',
    check: 'M5 12l4 4L20 5',
    expand: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
    arrow: 'M5 12h14M13 6l6 6-6 6',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
