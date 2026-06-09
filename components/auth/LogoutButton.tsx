"use client";

import type { MouseEvent, ReactNode } from "react";
import { prepareLikesForLogout } from "@/lib/likes/logout-likes";

type Props = {
  next?: string;
  className?: string;
  formClassName?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
};

/** POST /logout after moving likes to anon cookie (unlike works while logged out). */
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

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.();
    event.preventDefault();
    try {
      await prepareLikesForLogout();
    } catch {
      /* proceed with logout */
    }
    window.location.assign(action);
  };

  return (
    <form action={action} method="post" className={formClassName}>
      <button
        type="submit"
        className={className}
        aria-label={ariaLabel}
        onClick={(event) => void handleClick(event)}
      >
        {children}
      </button>
    </form>
  );
}
