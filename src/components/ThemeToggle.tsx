import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-muted transition-colors hover:bg-muted/80"
      aria-label="Toggle theme"
    >
      <span
        className={`inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-card shadow-md transition-transform duration-300 ${
          theme === "dark" ? "translate-x-11" : "translate-x-1"
        }`}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-gold" />
        ) : (
          <Moon className="h-4 w-4 text-accent" />
        )}
      </span>
    </button>
  );
};
