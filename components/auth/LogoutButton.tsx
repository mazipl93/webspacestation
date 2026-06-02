import type { ReactNode } from "react";

type Props = {
  next?: string;
  className?: string;
  formClassName?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
};

/** Native POST to /logout — works without client-side Supabase signOut. */
export default function LogoutButton({
  next = "/",
  className,
  formClassName,
  children,
  onClick,
  "aria-label": ariaLabel,
}: Props) {
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const action = `/logout?next=${encodeURIComponent(target)}`;

  return (
    <form action={action} method="post" className={formClassName}>
      <button
        type="submit"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </button>
    </form>
  );
}
