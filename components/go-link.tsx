"use client";

import type { AnchorHTMLAttributes } from "react";

export function goTo(href: string) {
  window.location.assign(href);
}

export function Go({
  href,
  children,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      {...rest}
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        goTo(href);
      }}
    >
      {children}
    </a>
  );
}
