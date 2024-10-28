import Link from "next/link";

export const HeaderButton = ({ children, href, theme }: any) => {
  // console.log("HeaderButton theme:", theme);
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
