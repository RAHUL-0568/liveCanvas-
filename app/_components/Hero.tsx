"use client";

import { ArrowRight } from "lucide-react";
import React from "react";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const { user, loading } = useAuth();

  return (
    <section className="relative bg-background text-foreground overflow-hidden">
      <div className="absolute top-28 w-full justify-center flex ">
        <div className="py-2 px-2 rounded-3xl border border-border bg-card/80 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
          <p className="mx-auto text-foreground text-sm">
            See what&apos;s new |{" "}
            <span className="text-primary font-medium">AI Diagrams {">"} </span>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-screen-xl px-8 py-32 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto max-w-3xl mt-8 text-center">
          <h1 className="bg-gradient-to-r from-blue-400 via-blue-600 to-purple-600 bg-clip-text p-2 text-3xl font-extrabold text-transparent sm:text-5xl">
            Documents & diagrams
          </h1>
          <p className="sm:block text-5xl font-bold tracking-tight text-foreground">
            {" "}
            for engineering teams{" "}
          </p>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-xl/relaxed">
            All-in-one markdown editor, collaborative canvas, and
            diagram-as-code builder
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 min-h-[50px]">
            {!loading && (
              <a
                href={user ? "/dashboard" : "/sign-in"}
                className="flex items-center w-full rounded-lg border border-border bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm sm:w-auto"
              >
                {user ? "Go to Dashboard" : "Get Started"}
                <p className="ml-2">
                  <ArrowRight size={20} />
                </p>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
