"use client";

import Sidebar from "@/app/_components/Sidebar";
import { FileListContext, Team } from "@/app/_context/FileListContext";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const convex = useConvex();
  const router = useRouter();

  const [fileList, setFileList] = useState([] as any[]);
  const [activeTeam, setActiveTeam] = useState<Team | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (user) {
      checkTeam();
    }
  }, [user, loading]);

  const checkTeam = async () => {
    const result = await convex.query(api.teams.getTeams, {
      email: user?.email!,
    });
    if (!result.length) {
      router.push("/team/create");
    } else if (!activeTeam) {
      setActiveTeam(result[0] as Team);
    }
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden" suppressHydrationWarning>
      <FileListContext.Provider
        value={{
          fileList,
          setFileList,
          activeTeam,
          setActiveTeam,
          isMobileMenuOpen,
          setIsMobileMenuOpen,
        }}
      >
        <div className="flex h-full relative">
          {/* Desktop Sidebar Area */}
          <div className="hidden sm:block w-64 shrink-0 h-full border-r border-border bg-card">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="sm:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          <div className={cn(
            "sm:hidden fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transition-transform duration-300 ease-in-out transform",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="h-full relative">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              <div className="h-full pt-8">
                <Sidebar />
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 h-full overflow-y-auto bg-background text-foreground">
            {children}
          </div>
        </div>
      </FileListContext.Provider>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
