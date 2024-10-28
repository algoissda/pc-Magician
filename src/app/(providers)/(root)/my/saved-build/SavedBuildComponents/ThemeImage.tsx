import React from "react";

interface ThemeImageProps {
  theme: string;
  mouseX: number;
  mouseY: number;
}

const ThemeImage: React.FC<ThemeImageProps> = ({ theme, mouseX, mouseY }) => {
  const moveX =
    typeof window !== "undefined"
      ? (mouseX - window.innerWidth / 2) * -0.01
      : 0;
  const moveY =
    typeof window !== "undefined"
      ? (mouseY - window.innerHeight / 2) * -0.01
      : 0;

  return (
    <>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-gray-400/0 to-gray-400 z-0 pointer-events-none theme-opacity ${
          theme !== "dark" ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-pink-500/0 to-black z-0 pointer-events-none theme-opacity ${
          theme === "dark" ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <img
        src="https://image.tmdb.org/t/p/original/x5BwPpYXAEYDgh4RHFnaVSz2Ogi.jpg"
        alt="light theme background"
        style={{ transform: `translate(${moveX}px, ${moveY}px)` }}
        className={`absolute inset-0 w-full transform transition-transform duration-500 ease-in-out ${
          theme !== "dark" ? "opacity-100 " : "opacity-0 "
        } pointer-events-none blur-mask`}
      />
      <img
        src="https://embed.pixiv.net/spotlight.php?id=9496&lang=ko"
        alt="dark theme background"
        style={{ transform: `translate(${moveX}px, ${moveY}px)` }}
        className={`absolute inset-0 w-full transform transition-transform duration-500 ease-in-out ${
          theme === "dark" ? "opacity-100 " : "opacity-0 "
        } pointer-events-none blur-mask`}
      />
    </>
  );
};

export default ThemeImage;
