"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import SidebarTopButton, { Team } from "./SidebarTopButton";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Folder, FolderPlus, MoreVertical, Trash, Edit2 } from "lucide-react";
import SideNavBottomMenu from "./SideNavBottomMenu";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { FileListContext } from "../_context/FileListContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ConvexError } from "convex/values";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");
  
  const { fileList, setFileList, activeTeam, setActiveTeam, selectedFolder, setSelectedFolder } = useContext(FileListContext);

  const folders = useQuery(api.folders.getFolders, { teamId: activeTeam?._id ?? "" });
  const createFolder = useMutation(api.folders.createFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const renameFolder = useMutation(api.folders.renameFolder);

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<any>(null);

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

  const [totalFiles, setTotalFiles] = useState<Number>();
  const [totalArchivedFiles, setTotalArchivedFiles] = useState<Number>();

  // Fetch files reactively
  const serverFileList = useQuery(api.files.getFiles, {
    teamId: activeTeam?._id ?? "",
    email: user?.email ?? undefined,
    type: pathname.includes("shared") ? "shared" : "team",
    folderId: selectedFolder?._id ?? undefined,
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
        folderId: selectedFolder?._id ?? undefined,
      }).then(
        (res) => {
          toast.success("File created successfully");
        },
        (error) => {
          const errorMsg = error instanceof ConvexError ? (error.data as string) : (error.message || "Error creating file");
          toast.error(errorMsg);
          console.error(error);
        },
      );
    } catch (error: any) {
      const errorMsg = error instanceof ConvexError ? (error.data as string) : (error.message || "Error creating file");
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    if (editingFolder) {
      renameFolder({ _id: editingFolder._id, name: newFolderName }).then(() => {
        toast.success("Folder renamed");
        setIsFolderDialogOpen(false);
        setEditingFolder(null);
        setNewFolderName("");
      });
      return;
    }

    createFolder({
      name: newFolderName,
      teamId: activeTeam?._id!,
      createdBy: user?.email!,
    }).then(() => {
      toast.success("Folder created");
      setIsFolderDialogOpen(false);
      setNewFolderName("");
    });
  };

  const handleDeleteFolder = (e: any, folderId: any) => {
    e.stopPropagation();
    deleteFolder({ _id: folderId }).then(() => {
      toast.success("Folder deleted");
      if (selectedFolder?._id === folderId) setSelectedFolder(undefined);
    });
  };

  const router = useRouter();

  return (
    <div className="h-full py-4 px-4 flex flex-col bg-background border-r">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <SidebarTopButton
          user={adaptedUser}
          setActiveTeamInfo={(team: Team) => setActiveTeam(team)}
        />
        
        <div className="mt-8 space-y-1">
          <Button
            variant={pathname === "/dashboard" && !selectedFolder ? "outline" : "ghost"}
            onClick={() => {
              setSelectedFolder(undefined);
              router.push("/dashboard");
            }}
            className={cn(
              "w-full text-left justify-start hover:bg-accent hover:text-accent-foreground transition-all",
              pathname === "/dashboard" && !selectedFolder ? "bg-secondary border-border" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard size={16} className="mr-2" />
            All files
          </Button>
          <Button
            variant={pathname === "/dashboard/shared" ? "outline" : "ghost"}
            onClick={() => {
              setSelectedFolder(undefined);
              router.push("/dashboard/shared");
            }}
            className={cn(
              "w-full text-left justify-start hover:bg-accent hover:text-accent-foreground transition-all",
              pathname === "/dashboard/shared" ? "bg-secondary border-border" : "text-muted-foreground"
            )}
          >
            <Users size={16} className="mr-2" />
            Shared with me
          </Button>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h2>
            <button 
              onClick={() => {
                setEditingFolder(null);
                setNewFolderName("");
                setIsFolderDialogOpen(true);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FolderPlus size={16} />
            </button>
          </div>
          
          <div className="space-y-1">
            {folders?.map((folder: any) => (
              <div
                key={folder._id}
                onClick={() => {
                  setSelectedFolder(folder);
                  router.push("/dashboard");
                }}
                className={cn(
                  "group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg cursor-pointer transition-all",
                  selectedFolder?._id === folder._id 
                    ? "bg-secondary text-foreground border border-border shadow-sm" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder size={14} className={cn(selectedFolder?._id === folder._id ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{folder.name}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
                      <MoreVertical size={12} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolder(folder);
                        setNewFolderName(folder.name);
                        setIsFolderDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit2 size={12} /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => handleDeleteFolder(e, folder._id)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash size={12} /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-4">
        <SideNavBottomMenu onFileCreate={onFileCreate} length={totalFiles} />
      </div>

      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Rename Folder" : "Create Folder"}</DialogTitle>
            <DialogDescription>
              {editingFolder ? "Enter a new name for your folder." : "Give your folder a name to keep things organized."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Design Assets, Backend"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              {editingFolder ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
