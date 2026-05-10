"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Command, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CreateTeamPage = () => {
  const { user, loading } = useAuth();
  const [teamName, setTeamName] = useState("" as string);
  const createTeam = useMutation(api.teams.createTeam);
  const router = useRouter();

  if (loading) return null;
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleCreateTeam = async () => {
    createTeam({
      teamName,
      createdBy: user?.email!,
    }).then((res) => {
      if (res && (res as any).error) {
        toast.error((res as any).error);
        return;
      }
      if (res) {
        router.push("/dashboard");
        toast.success("Team created successfully");
      }
    });
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-background text-foreground">
      <div className="absolute top-8 left-8 flex items-center space-x-2">
        <Command className="text-primary" size={32} />
        <h1 className="text-foreground font-bold text-xl">LiveCanvas</h1>
      </div>
      
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="absolute top-8 right-8 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="flex flex-col gap-4 justify-center items-center px-4">
        <div className="text-center w-full">
          <h1 className="font-bold text-3xl md:text-4xl mb-4">
            What should we call your team?
          </h1>

          <h3 className="text-muted-foreground">
            You can always change this later from settings.
          </h3>
        </div>
        <div className="grid w-full max-w-lg items-center gap-1.5 mt-8 mb-8">
          <Label htmlFor="team_name">Team Name</Label>
          <Input
            className="bg-background border-border"
            type="text"
            id="team_name"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && teamName.length > 0) {
                handleCreateTeam();
              }
            }}
          />
        </div>

        <Button
          onClick={handleCreateTeam}
          disabled={!(teamName && teamName.length > 0)}
          className="bg-blue-500 text-white w-full max-w-[300px] hover:bg-blue-600 h-11"
        >
          Create team
        </Button>
      </div>
    </div>
  );
};

export default CreateTeamPage;
