"use client";

import { ChevronDown, Command, MoreHorizontal, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export interface Team {
  _id: string;
  teamName: string;
  createdBy: string;
}

const SidebarTopButton = ({ user, setActiveTeamInfo }: any) => {
  const router = useRouter();
  const convex = useConvex();
  const deleteTeam = useMutation(api.teams.deleteTeam);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.assign("/");
  };

  const handleDeleteTeam = (id: string) => {
    const loadingToast = toast.loading("Deleting team...");
    deleteTeam({ _id: id as Id<"teams"> }).then((res) => {
      toast.dismiss(loadingToast);
      toast.success("Team deleted successfully");
      getTeamList();
    }).catch((err) => {
      toast.dismiss(loadingToast);
      toast.error("Error deleting team");
      console.error(err);
    });
  };

  const menu = [
    {
      id: 1,
      name: "create team",
      path: "/team/create",
      icon: <Plus size={16} className="mr-2" />,
    },
    {
      id: 2,
      name: "settings",
      path: "/dashboard/settings",
      icon: <Settings size={16} className="mr-2" />,
    },
  ];
  
  const [activeTeam, setActiveTeam] = useState<Team>();
  let [teamList, setTeamList] = useState([] as Team[]);

  // Fetch user profile from Convex
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");

  const [userDisplayName, setUserDisplayName] = useState("");

  useEffect(() => {
    if (convexUser && convexUser.firstName) {
      // Use custom name from Convex if available
      const firstName = convexUser.firstName || "";
      const lastName = convexUser.lastName || "";
      setUserDisplayName(`${firstName} ${lastName}`.trim());
    } else if (user) {
      // Fallback to auth profile name
      setUserDisplayName(user.name || "");
    }
  }, [convexUser, user]);

  const getTeamList = async () => {
    if (!user?.email) return;
    
    try {
      const result = await convex.query(api.teams.getTeams, {
        email: user.email,
      });
      setTeamList(result);
      if (result.length > 0) {
        // If current active team was deleted or not set, set to first available
        if (!activeTeam || !result.find(t => t._id === activeTeam._id)) {
          setActiveTeam(result[0]);
        }
      } else {
        setActiveTeam(undefined);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      getTeamList();
    }
  }, [user?.email]);

  useEffect(() => {
    activeTeam ? setActiveTeamInfo(activeTeam) : null;
  }, [activeTeam]);

  let [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild className="outline-none">
        <div
          className={cn(
            "flex items-center w-fit hover:bg-accent hover:text-accent-foreground gap-2.5 cursor-pointer rounded-lg p-2 mt-4 ml-2 transition-all border border-transparent hover:border-border/50",
            { "bg-accent text-accent-foreground border-border": isOpen }
          )}
        >
          <div className="p-1 bg-primary/10 rounded-md">
            <Command className="text-primary" size={20} />
          </div>
          <h2 className="text-sm font-bold text-foreground truncate max-w-[120px]">{activeTeam?.teamName || "Select Team"}</h2>
          <ChevronDown size={14} className="text-muted-foreground ml-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover gap-1 rounded-lg text-popover-foreground border-border w-60 ml-4 mt-2 shadow-xl">
        {teamList &&
          teamList.map((team) => (
            <div key={team._id} className="flex items-center justify-between px-2 py-1 hover:bg-accent rounded-md group">
              <DropdownMenuItem
                onClick={() => setActiveTeam(team)}
                className={cn(
                  "cursor-pointer flex-1 focus:bg-transparent focus:text-inherit p-1",
                  {
                    "font-bold text-primary":
                      activeTeam?._id === team._id,
                  }
                )}
              >
                {team.teamName}
              </DropdownMenuItem>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={14} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTeam(team._id);
                    }}
                  >
                    <Trash size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

        <DropdownMenuSeparator className="bg-border" />
        {menu.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              router.push(item.path);
            }}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            {item.icon}
            {item.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          onClick={handleLogout}
        >
            <LogOut size={16} className="mr-2" />
            Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mt-1">
          <div>
              <img
                src={
                  user?.image ??
                  "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais"
                }
              alt="user picture"
              className="rounded-full h-8 w-8 object-cover border border-border"
            />
          </div>
          <div className="-space-y-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">
              {userDisplayName || "User"}
            </p>
            <p className="text-xs font-light truncate text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarTopButton;
