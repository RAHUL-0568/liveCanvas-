"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, LogOut, X, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut(auth);
    window.location.assign("/");
  };

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "History", href: "/history" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
  ];

  return (
    <header className="z-50 w-full fixed backdrop-blur-xl border-b border-border/50 bg-background/85">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <a className="flex gap-2 items-center" href="/">
          <Command className="text-primary" size={28} />
          <p className="text-foreground font-semibold">LiveCanvas</p>
        </a>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    className="text-foreground/80 transition hover:text-primary"
                    href={link.href}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex sm:gap-4">
              {!loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <Button asChild variant="outline" className="hidden sm:flex">
                      <a href="/dashboard">Dashboard</a>
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="gap-2">
                      <LogOut size={16} />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    <a
                      href="/sign-in"
                      className="block rounded-lg px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
                    >
                      Sign in
                    </a>
                    <a
                      href="/sign-up"
                      className="hidden md:block rounded-lg px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary transition hover:bg-primary/90"
                    >
                      Sign up
                    </a>
                  </>
                )
              )}
            </div>
            <ThemeToggle />

            {/* Hamburger Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block rounded bg-muted p-2.5 text-foreground transition hover:text-foreground/75 md:hidden"
            >
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
      )}>
        <ul className="flex flex-col px-6 gap-4">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground/80 block py-2 text-sm font-medium transition hover:text-primary"
                href={link.href}
              >
                {link.name}
              </a>
            </li>
          ))}
          <hr className="border-border my-2" />
          {!loading && (
            user ? (
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full justify-start">
                  <a href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
                </Button>
                <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <a
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg py-2.5 text-sm font-medium text-foreground"
                >
                  Sign in
                </a>
                <a
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Sign up
                </a>
              </div>
            )
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
