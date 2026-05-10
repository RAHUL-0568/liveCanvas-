"use client";

import React, { useMemo, useState, useEffect } from "react";
import DashboardHeader from "../_components/DashboardHeader";
import DashboardTable from "../_components/DashboardTable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PrivateFilesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);

  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");
  const setPin = useMutation(api.user.setPrivatePin);

  const adaptedUser = useMemo(() => {
    if (!user) return null;
    const defaultName = user.email ? user.email.split("@")[0] : "User";
    return {
      email: user.email || "",
      name: user.displayName || defaultName,
      image: user.photoURL
    };
  }, [user]);

  const handleUnlock = () => {
    if (convexUser?.privatePin === pinInput) {
      setIsUnlocked(true);
      toast.success("Vault Unlocked");
    } else {
      toast.error("Incorrect PIN");
      setPinInput("");
    }
  };

  const handleCreatePin = async () => {
    if (pinInput.length < 4) {
      toast.error("PIN must be at least 4 digits");
      return;
    }
    try {
      await setPin({
        email: user?.email!,
        pin: pinInput
      });
      setIsUnlocked(true);
      toast.success("Private PIN set successfully");
    } catch (error) {
      toast.error("Failed to set PIN");
    }
  };

  if (loading) return null;

  if (!isUnlocked) {
    const hasPin = !!convexUser?.privatePin;
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-primary w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {hasPin ? "Private Vault Locked" : "Set Your Private PIN"}
            </h1>
            <p className="text-muted-foreground text-sm px-4">
              {hasPin 
                ? "Enter your secure 4-digit PIN to access your private files." 
                : "Create a 4-digit PIN to secure your private files section."}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="••••"
              maxLength={4}
              className="text-center text-3xl tracking-[1em] h-16 font-mono"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  hasPin ? handleUnlock() : handleCreatePin();
                }
              }}
            />
            
            <Button 
              className="w-full h-12 text-base font-semibold"
              onClick={hasPin ? handleUnlock : handleCreatePin}
            >
              {hasPin ? (
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} /> Unlock Vault
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <KeyRound size={18} /> Set PIN
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-muted-foreground w-full"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <h2 className="font-bold text-2xl flex items-center gap-2">
          <ShieldCheck className="text-green-500" />
          Private Vault
        </h2>
        <p className="text-muted-foreground text-sm">Access your secure archived files here.</p>
      </div>
      <DashboardTable isArchive={true} isPrivateOnly={true} />
    </div>
  );
};

export default PrivateFilesPage;
