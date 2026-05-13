"use client";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Archive,
  Info,
  LayoutDashboard,
  MoreHorizontal,
  Save,
  Command,
  ShieldCheck,
  ChevronRight,
  Share2,
  FileText,
  MousePointer2,
  Columns
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

const WorkSpaceHeader = ({
  Tabs,
  setActiveTab,
  activeTab,
  onSave,
  file,
}: any) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!file?._id) return;
    setIsSharing(true);
    
    try {
      const response = await fetch("/api/network-ip");
      const data = await response.json();
      const networkUrl = `http://${data.ip}:${data.port}/workspace/${file._id}`;
      
      await navigator.clipboard.writeText(networkUrl);
      toast.success("Link copied to clipboard!", {
        description: networkUrl
      });
    } catch (error) {
      console.error("Share error:", error);
      const fallbackUrl = `${window.location.origin}/workspace/${file._id}`;
      await navigator.clipboard.writeText(fallbackUrl);
      toast.success("Link copied!", {
        description: fallbackUrl
      });
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <div className="border-b border-border h-14 flex items-center px-2 sm:px-4 w-full bg-background/95 backdrop-blur sticky top-0 z-50">
      {/* Breadcrumbs and File Name */}
      <div className="flex items-center gap-1 sm:gap-4 flex-1 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Command className="text-primary" size={18} />
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center text-muted-foreground gap-2 shrink-0">
          <ChevronRight size={14} />
          <span className="text-xs font-medium truncate max-w-[100px]">
            {file?.teamName || "Workspace"}
          </span>
          <ChevronRight size={14} />
        </div>

        <div className="flex items-center gap-0.5 min-w-0">
          <h1 className="text-xs sm:text-sm font-semibold truncate max-w-[70px] sm:max-w-[150px] md:max-w-[200px]">
            {file ? file.fileName : "Untitled"}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors outline-none">
                <MoreHorizontal size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Archive size={14} />
                Archive File
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Mode Tabs - Dynamic for mobile/desktop */}
      <div className="flex flex-1 justify-center px-1">
        <div className="bg-muted/50 p-1 rounded-lg sm:rounded-xl border border-border flex items-center gap-0.5 sm:gap-1">
          {Tabs.map((tab: any) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "px-2 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                activeTab === tab.name
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {tab.name === "Document" && <FileText size={14} className="sm:hidden" />}
              {tab.name === "Canvas" && <MousePointer2 size={14} className="sm:hidden" />}
              {tab.name === "Both" && <Columns size={14} className="sm:hidden" />}
              
              <span className="hidden sm:inline">{tab.name}</span>
              {tab.name === "Both" && <span className="sm:hidden">Mix</span>}
              {tab.name === "Document" && <span className="sm:hidden">Doc</span>}
              {tab.name === "Canvas" && <span className="sm:hidden">Can</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 sm:gap-3 flex-1">
        <div className="hidden md:flex items-center pr-1 sm:pr-2 border-r border-border mr-1 sm:mr-2">
          <ThemeToggle />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSave()}
          className="hidden sm:flex h-8 sm:h-9 gap-2 border-border hover:bg-accent px-2 sm:px-3"
        >
          <Save size={14} />
          <span className="text-xs">Save</span>
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onSave()}
          className="sm:hidden h-8 w-8"
        >
          <Save size={16} />
        </Button>

        <Button
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="h-8 sm:h-9 gap-1.5 px-2 sm:px-4 shadow-sm"
        >
          {isSharing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Share2 size={14} />
          )}
          <span className="hidden sm:inline text-xs">Share</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 sm:p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 sm:w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck size={16} />
                <h4 className="text-sm font-bold">LiveCanvas</h4>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Collaborative workspace. Changes sync in real-time.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default WorkSpaceHeader;
