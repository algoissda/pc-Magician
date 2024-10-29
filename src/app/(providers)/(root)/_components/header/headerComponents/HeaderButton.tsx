import Link from "next/link";
import { ReactNode } from "react";

type HeaderButtonProps = {
  children: ReactNode;
  href: string;
  theme: "dark" | "light";
};

export const HeaderButton = ({ children, href, theme }: HeaderButtonProps) => {
  return (
    <Link
      href={href}
      className={`main-text text-[40px] font-extrabold font-serif text-${
        theme === "dark" ? "white" : "black"
      }`}
    >
      {children}
    </Link>
  );
};
