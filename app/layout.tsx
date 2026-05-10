import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "./_components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LiveCanvas - Collaborative Whiteboard & Diagramming Tool",
  description: "A modern collaborative whiteboard application for engineering teams to create documents, diagrams, and visual content together in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground transition-colors duration-300")}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

