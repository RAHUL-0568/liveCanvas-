"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  Delete,
  Edit,
  MoreHorizontal,
  LucideLock,
  Folder as FolderIcon,
  ChevronRight,
  Move,
  LayoutDashboard,
} from "lucide-react";
import { FileListContext, Folder } from "@/app/_context/FileListContext";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ConvexError } from "convex/values";
import Image from "next/image";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FILE {
  _id: string;
  fileName: string;
  createdBy: string;
  _creationTime: string;
  archieved: boolean;
  teamId: string;
  teamName?: string;
  document: string;
  whiteboard: string;
  isPrivate?: boolean;
  folderId?: string;
  lastAccessed?: number;
  contributors?: {
    email: string;
    name: string;
    image: string;
  }[];
}

const DashboardTable = ({
  isArchive = false,
  isPrivateOnly = false,
}: {
  isArchive?: boolean;
  isPrivateOnly?: boolean;
}) => {
  const {
    fileList,
    setFileList,
    selectedMenu,
    selectedFolder,
    setSelectedFolder,
    activeTeam,
  } = useContext(FileListContext);
  const [fileList_, setFileList_] = useState([] as FILE[]);
  const { user } = useAuth();

  const folders = useQuery(api.folders.getFolders, {
    teamId: activeTeam?._id ?? "",
  });
  const moveFileToFolder = useMutation(api.files.moveFileToFolder);

  const deleteFile = useMutation(api.files.deleteFile);
  const archiveFile = useMutation(api.files.archiveFile);
  const unarchiveFile = useMutation(api.files.unarchiveFile);
  const updateFileName = useMutation(api.files.updateFileName);
  const toggleFilePrivacy = useMutation(api.files.toggleFilePrivacy);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FILE | null>(null);
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    if (fileList) {
      let filteredFiles = [...fileList];

      if (isPrivateOnly) {
        // Show ONLY archived files that are marked private
        filteredFiles = filteredFiles.filter(
          (file: FILE) => file.archieved && file.isPrivate,
        );
      } else if (isArchive) {
        // Show archived files that are NOT marked private
        filteredFiles = filteredFiles.filter(
          (file: FILE) => file.archieved && !file.isPrivate,
        );
      } else {
        // Main Dashboard: Show only active (non-archived) files
        filteredFiles = filteredFiles.filter((file: FILE) => !file.archieved);
      }

      // Apply Menu Filtering & Sorting
      if (!isArchive && !isPrivateOnly) {
        if (selectedMenu === "recent") {
          // Sort by last accessed or creation time descending
          filteredFiles.sort(
            (a, b) =>
              (b.lastAccessed || b._creationTime) -
              (a.lastAccessed || a._creationTime),
          );
        } else if (selectedMenu === "created-by-me") {
          // Filter by author
          filteredFiles = filteredFiles.filter(
            (file) => file.createdBy === user?.email,
          );
          filteredFiles.sort(
            (a, b) =>
              (b.lastAccessed || b._creationTime) -
              (a.lastAccessed || a._creationTime),
          );
        } else {
          // "All" - Sort alphabetically
          filteredFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
        }
      }

      setFileList_(filteredFiles);
    }
  }, [fileList, isArchive, isPrivateOnly, selectedMenu, user?.email]);

  const handleArchive = (id: string, isCurrentlyArchived: boolean) => {
    if (isCurrentlyArchived) {
      unarchiveFile({ _id: id as Id<"files"> })
        .then((res) => {
          toast.success("File unarchived successfully");
          setFileList(
            fileList.map((file: any) =>
              file._id === id
                ? { ...file, archieved: false, isPrivate: false }
                : file,
            ),
          );
        })
        .catch((err) => {
          toast.error("Error unarchiving file");
        });
    } else {
      archiveFile({ _id: id as Id<"files"> })
        .then((res) => {
          toast.success("File archived successfully");
          setFileList(
            fileList.map((file: any) =>
              file._id === id ? { ...file, archieved: true } : file,
            ),
          );
        })
        .catch((err) => {
          toast.error("Error archiving file");
        });
    }
  };

  const handleTogglePrivacy = (id: string, currentPrivacy: boolean) => {
    toggleFilePrivacy({
      _id: id as Id<"files">,
      isPrivate: !currentPrivacy,
    })
      .then(() => {
        const msg = !currentPrivacy
          ? "Added to Private Files"
          : "Removed from Private Files";
        toast.success(msg);
        setFileList(
          fileList.map((file: any) =>
            file._id === id ? { ...file, isPrivate: !currentPrivacy } : file,
          ),
        );
      })
      .catch((err) => {
        toast.error("Error updating file privacy");
      });
  };

  const handleDelete = (id: string) => {
    const loadingToast = toast.loading("Deleting file...");
    deleteFile({ _id: id as Id<"files"> })
      .then((res) => {
        toast.dismiss(loadingToast);
        toast.success("File deleted successfully");
        const updatedList = fileList.filter((file: any) => file._id !== id);
        setFileList(updatedList);
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Error deleting file: " + (err.message || "Unknown error"));
      });
  };

  const handleRename = () => {
    if (!selectedFile || !newFileName.trim()) return;

    const loadingToast = toast.loading("Updating file name...");
    updateFileName({
      _id: selectedFile._id as Id<"files">,
      fileName: newFileName.trim(),
    })
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success("File renamed successfully");
        setFileList(
          fileList.map((file: any) =>
            file._id === selectedFile._id
              ? { ...file, fileName: newFileName.trim() }
              : file,
          ),
        );
        setIsRenameDialogOpen(false);
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        const errorMsg =
          err instanceof ConvexError
            ? (err.data as string)
            : err.message || "Error renaming file";
        toast.error(errorMsg);
      });
  };

  const router = useRouter();

  return (
    <div className="px-4 sm:px-10">
      {selectedFolder && (
        <div className="flex items-center gap-2 mb-6 px-2">
          <button
            onClick={() => setSelectedFolder(undefined)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            All Files
          </button>
          <ChevronRight size={14} className="text-muted-foreground" />
          <div className="flex items-center gap-2 text-foreground font-medium bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 text-sm">
            <FolderIcon size={16} className="text-primary" />
            {selectedFolder.name}
          </div>
        </div>
      )}

      <div className="w-full">
        <Table className="min-w-[700px] sm:min-w-full border-separate border-spacing-y-2.5">
          <TableHeader className="bg-transparent">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="font-medium text-muted-foreground py-3 px-6 text-[11px] uppercase tracking-widest opacity-80 bg-muted/30 rounded-l-lg border-y border-l border-border/40 w-[40%]">
                Name
              </TableHead>
              <TableHead className="font-medium text-muted-foreground py-3 px-6 text-[11px] uppercase tracking-widest opacity-80 bg-muted/30 border-y border-border/40">
                <span className="hidden md:inline">Project </span>Author
              </TableHead>
              <TableHead className="hidden sm:table-cell font-medium text-muted-foreground py-3 px-6 text-[11px] uppercase tracking-widest opacity-80 bg-muted/30 border-y border-border/40">
                Created
              </TableHead>
              <TableHead className="w-[80px] px-6 text-right bg-muted/30 rounded-r-lg border-y border-r border-border/40"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileList_ &&
              fileList_.map((file) => (
                <TableRow
                  onClick={() => {
                    router.push(`/workspace/${file._id}`);
                  }}
                  key={file._id}
                  className="group bg-card/40 hover:bg-muted/50 cursor-pointer transition-all duration-200"
                >
                  <TableCell className="py-5 px-6 rounded-l-xl border-y border-l border-border/40 group-hover:border-border transition-colors w-[40%]">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-all group-hover:scale-125" />
                      <span className="font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
                        {file.fileName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 border-y border-border/40 group-hover:border-border transition-colors">
                    <div className="flex items-center gap-12">
                      <span className="hidden md:block text-muted-foreground/70 text-sm truncate max-w-[120px]">
                        {file.teamName || "General"}
                      </span>
                      <div className="flex items-center">
                        <TooltipProvider>
                          {file.contributors && file.contributors.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 overflow-hidden">
                                {file.contributors.map((contributor, index) => (
                                  <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                      <Image
                                        src={contributor.image}
                                        alt={contributor.name}
                                        width={28}
                                        height={28}
                                        className={cn(
                                          "inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all",
                                          index === 0
                                            ? "z-0"
                                            : `z-${index * 10}`,
                                        )}
                                        unoptimized
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-[10px]">
                                        {contributor.name}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Image
                                src="https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais"
                                alt="logo"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all ring-1 ring-border/50"
                                unoptimized
                              />
                            </div>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground/60 hidden sm:table-cell py-5 px-6 border-y border-border/40 group-hover:border-border transition-colors">
                    {moment(file._creationTime).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell className="text-right py-5 px-6 rounded-r-xl border-y border-r border-border/40 group-hover:border-border transition-colors">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="outline-none">
                        <div
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md cursor-pointer transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={14} />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-popover text-popover-foreground border-border w-48 shadow-lg"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setNewFileName(file.fileName);
                            setIsRenameDialogOpen(true);
                          }}
                        >
                          <Edit size={14} />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(file._id, file.archieved);
                          }}
                        >
                          <Archive size={14} />
                          {file.archieved ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm transition-colors">
                              <Move size={14} /> Move to Folder
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="left"
                            align="start"
                            className="w-48"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                moveFileToFolder({
                                  _id: file._id as any,
                                  folderId: undefined,
                                })
                                  .then(() => toast.success("Moved to Root"))
                                  .catch((err) => {
                                    const errorMsg =
                                      err instanceof ConvexError
                                        ? (err.data as string)
                                        : err.message || "Failed to move file";
                                    toast.error(errorMsg);
                                  });
                              }}
                              className="gap-2"
                            >
                              <LayoutDashboard size={14} /> Root Directory
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {folders?.map((folder: any) => (
                              <DropdownMenuItem
                                key={folder._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveFileToFolder({
                                    _id: file._id as any,
                                    folderId: folder._id,
                                  })
                                    .then(() =>
                                      toast.success(`Moved to ${folder.name}`),
                                    )
                                    .catch((err) => {
                                      const errorMsg =
                                        err instanceof ConvexError
                                          ? (err.data as string)
                                          : err.message ||
                                            "Failed to move file";
                                      toast.error(errorMsg);
                                    });
                                }}
                                className="gap-2"
                              >
                                <FolderIcon
                                  size={14}
                                  className="text-primary"
                                />{" "}
                                {folder.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file._id);
                          }}
                        >
                          <Delete size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for your file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardTable;
