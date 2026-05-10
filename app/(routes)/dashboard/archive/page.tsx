"use client";

import React, { useMemo } from "react";
import DashboardHeader from "../_components/DashboardHeader";
import DashboardTable from "../_components/DashboardTable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const ArchivePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Adapt Firebase user to the format expected by DashboardHeader
  const adaptedUser = useMemo(() => {
    if (!user) return null;
    const defaultName = user.email ? user.email.split("@")[0] : "User";
    return {
      email: user.email || "",
      name: user.displayName || defaultName,
      image: user.photoURL
    };
  }, [user]);

  if (loading) return null;

  return (
    <div className="min-h-full pb-10">
      <DashboardHeader user={adaptedUser} />
      <div className="px-10 mt-5 relative">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
          className="absolute top-0 right-10 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <h2 className="font-bold text-2xl">Archive</h2>
        <p className="text-muted-foreground text-sm">View and manage your archived files.</p>
      </div>
      <DashboardTable isArchive={true} />
    </div>
  );
};

export default ArchivePage;
