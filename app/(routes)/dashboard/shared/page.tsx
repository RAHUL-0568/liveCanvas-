"use client";

import React, { useMemo } from "react";
import DashboardHeader from "../_components/DashboardHeader";
import DashboardTable from "../_components/DashboardTable";
import { useAuth } from "@/hooks/useAuth";

const SharedPage = () => {
  const { user, loading } = useAuth();

  // Adapt Firebase user
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
    <div className="min-h-full">
      <div className="px-10 pt-10 pb-0">
        <h1 className="text-2xl font-bold">Shared with me</h1>
        <p className="text-muted-foreground text-sm">Files shared with you by other teams.</p>
      </div>
      <DashboardTable isArchive={false} />
    </div>
  );
};

export default SharedPage;
