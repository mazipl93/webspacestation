/** Geometryczne W — akcent jak NASA Worm / Axios (jedna litera „custom”). */

type Props = {
  height: number;
  className?: string;
};

export default function WssLetterWCustom({ height, className }: Props) {
  const w = Math.round(height * 0.62);
  return (
    <svg
      viewBox="0 0 28 36"
      width={w}
      height={height}
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M0 36h4.2L7.2 12.5 14 28.5 20.8 12.5 23.8 36H28L21.2 4h-3.6L14 20.2 10.4 4H6.8L0 36z" />
      <circle cx="14" cy="5.5" r="2.2" className="fill-accent-cyan" />
    </svg>
  );
}
