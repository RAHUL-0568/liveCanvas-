"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import SidebarTopButton, { Team } from "./SidebarTopButton";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users } from "lucide-react";
import SideNavBottomMenu from "./SideNavBottomMenu";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { FileListContext } from "../_context/FileListContext";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");
  
  // Adapt Firebase user, prioritizing Convex data for name and image
  const adaptedUser = useMemo(() => {
    if (!user) return null;
    
    let name = user.displayName || "User";
    if (convexUser?.firstName) {
      name = `${convexUser.firstName} ${convexUser.lastName || ""}`.trim();
    }

    return {
      email: user.email || "",
      name: name,
      image: convexUser?.image || user.photoURL
    };
  }, [user, convexUser]);

  const createFile = useMutation(api.files.createNewFile);

  const { fileList, setFileList, activeTeam, setActiveTeam } = useContext(FileListContext);
  const [totalFiles, setTotalFiles] = useState<Number>();
  const [totalArchivedFiles, setTotalArchivedFiles] = useState<Number>();

  // Fetch files reactively
  const serverFileList = useQuery(api.files.getFiles, {
    teamId: activeTeam?._id ?? "",
    email: user?.email ?? undefined,
    type: pathname.includes("shared") ? "shared" : "team",
  });

  useEffect(() => {
    if (serverFileList) {
      setFileList(serverFileList);
      // Only count non-private files towards the team's file limit
      const nonPrivateFiles = serverFileList.filter((file: any) => !file.isPrivate);
      setTotalFiles(nonPrivateFiles.length);
      setTotalArchivedFiles(serverFileList.filter((file: any) => file.archieved).length);
    }
  }, [serverFileList]);

  const onFileCreate = (fileName: string) => {
    try {
      createFile({
        fileName,
        teamId: activeTeam?._id!,
        createdBy: user?.email!,
        archieved: false,
        document: "",
        whiteboard: "",
      }).then(
        (res) => {
          toast.success("File created successfully");
        },
        (error) => {
          toast.error("Error creating file");
          console.error(error);
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const router = useRouter();

  return (
    <div className="h-full py-4 px-4 flex flex-col bg-background border-r">
      <div className="flex-1">
        <SidebarTopButton
          user={adaptedUser}
          setActiveTeamInfo={(team: Team) => setActiveTeam(team)}
        />
        <Button
          variant={"outline"}
          onClick={() => router.push("/dashboard")}
          className="bg-secondary border-border w-full mt-10 text-left justify-start hover:bg-accent hover:text-accent-foreground"
        >
          <LayoutDashboard size={16} className="mr-2" />
          All files
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => router.push("/dashboard/shared")}
          className="w-full mt-2 text-left justify-start hover:bg-accent hover:text-accent-foreground text-muted-foreground"
        >
          <Users size={16} className="mr-2" />
          Shared with me
        </Button>
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-4">
        <SideNavBottomMenu onFileCreate={onFileCreate} length={totalFiles} />
      </div>
    </div>
  );
};

export default Sidebar;
