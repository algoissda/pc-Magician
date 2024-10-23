import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ThemeToggleButton = ({ theme, toggleTheme }: any) => {
  return (
    <button
      onClick={toggleTheme}
      className={`bg-${
        theme === "dark" ? "white" : "black"
      } w-10 h-10 rounded-full flex justify-center items-center p-[1px]`}
    >
      <FontAwesomeIcon
        className={`text-${
          theme === "dark" ? "black" : "white"
        } w-9 h-9 rounded-full text-3xl`}
        icon={theme === "dark" ? faSun : faMoon}
      />
    </button>
  );
};
