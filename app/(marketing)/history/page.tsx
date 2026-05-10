import React from 'react';
import { Lock, Layout, FileText, Palette, Share2, CheckCircle2, Sparkles } from 'lucide-react';

const HistoryPage = () => {
  const milestones = [
    { year: "Feb 5, 2026", event: "UI Foundation", icon: <Palette className="w-5 h-5" />, description: "Established the core design system using Tailwind CSS and Radix UI. Built the responsive Header and Footer components." },
    { year: "Feb 22, 2026", event: "Component Library", icon: <Layout className="w-5 h-5" />, description: "Created a comprehensive library of reusable UI components including buttons, dialogs, and navigation elements." },
    { year: "Mar 10, 2026", event: "Auth Integration", icon: <Lock className="w-5 h-5" />, description: "Implemented secure user authentication and social login features using Google Auth." },
    { year: "Mar 28, 2026", event: "Dashboard & Navigation", icon: <Share2 className="w-5 h-5" />, description: "Developed the user dashboard and team management interface. Implemented the dynamic sidebar and file listing views." },
    { year: "Apr 15, 2026", event: "Document Editor Integration", icon: <FileText className="w-5 h-5" />, description: "Successfully integrated Editor.js into the workspace, allowing users to create structured documentation with custom blocks." },
    { year: "Apr 25, 2026", event: "File Management", icon: <CheckCircle2 className="w-5 h-5" />, description: "Added support for nested folders and advanced file organization within teams." },
    { year: "Apr 26, 2026", event: "Canvas Integration", icon: <Palette className="w-5 h-5" />, description: "Integrated Excalidraw for whiteboarding, enabling users to draw and brainstorm visually." },
    { year: "Apr 28, 2026", event: "Real-time Sync", icon: <Share2 className="w-5 h-5" />, description: "Connected Convex for real-time data persistence and multi-user collaboration across all tools." },
    { year: "Apr 30, 2026", event: "AI Architecture Generation", icon: <Sparkles className="w-5 h-5" />, description: "Integrated Google Gemini as a spatial layout engine to automatically generate complex, brand-aware architectural diagrams from text prompts." },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen overflow-x-hidden">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-foreground tracking-tight sm:text-6xl mb-4">
          Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">History</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          From a simple idea to a powerful collaboration engine. Explore the milestones that shaped LiveCanvas.
        </p>
      </div>

      <div className="relative">
        {/* Central Vertical Line - Desktop Only */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-primary/20 hidden md:block" />

        <div className="space-y-12 md:space-y-0">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative flex flex-col md:flex-row items-center justify-between w-full md:py-8">
              {/* Left Side Content */}
              <div className="hidden md:flex w-1/2 pr-12 justify-end">
                {index % 2 === 0 ? (
                  <div className="bg-card rounded-2xl shadow-xl px-8 py-6 border border-border transition-all hover:scale-[1.05] text-right w-full max-w-md">
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">{milestone.year}</span>
                    <h4 className="mt-1 mb-3 font-bold text-foreground text-2xl">{milestone.event}</h4>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Central Icon */}
              <div className="z-20 flex items-center justify-center bg-background text-primary shadow-lg w-12 h-12 rounded-full border-4 border-primary shrink-0 absolute left-4 md:left-1/2 md:-translate-x-1/2">
                {milestone.icon}
              </div>

              {/* Right Side Content */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12 flex justify-start">
                {index % 2 !== 0 ? (
                  <div className="bg-card rounded-2xl shadow-xl w-full px-8 py-6 border border-border transition-all hover:scale-[1.05] max-w-md hidden md:block">
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">{milestone.year}</span>
                    <h4 className="mt-1 mb-3 font-bold text-foreground text-2xl">{milestone.event}</h4>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                ) : null}
                
                {/* Mobile-only visible card (shows on right side for all items) */}
                <div className="bg-card rounded-2xl shadow-xl w-full px-8 py-6 border border-border transition-all hover:scale-[1.05] max-w-md md:hidden block">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">{milestone.year}</span>
                  <h4 className="mt-1 mb-3 font-bold text-foreground text-2xl">{milestone.event}</h4>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
