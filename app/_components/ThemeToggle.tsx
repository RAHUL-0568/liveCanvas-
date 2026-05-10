"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="w-10 h-10 border-2 border-primary/20 bg-background opacity-50"
        disabled
      >
        <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const toggleTheme = () => {
    // Force toggle between 'light' and 'dark'
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="w-10 h-10 border-2 border-primary/50 bg-background shadow-md hover:bg-accent hover:border-primary transition-all flex items-center justify-center relative active:scale-95"
      onClick={toggleTheme}
    >
      {/* Sun icon visible in light mode, hidden in dark mode */}
      <Sun 
        className={`h-[1.2rem] w-[1.2rem] transition-all text-orange-500 
          ${resolvedTheme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} 
      />
      
      {/* Moon icon visible in dark mode, hidden in light mode */}
      <Moon 
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all text-blue-500
          ${resolvedTheme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} 
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
