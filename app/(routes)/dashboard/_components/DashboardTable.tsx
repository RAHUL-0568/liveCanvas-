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
import { Archive, Delete, Edit, MoreHorizontal, LucideLock } from "lucide-react";
import { FileListContext } from "@/app/_context/FileListContext";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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
  contributors?: {
    email: string;
    name: string;
    image: string;
  }[];
}

const DashboardTable = ({ isArchive = false, isPrivateOnly = false }: { isArchive?: boolean, isPrivateOnly?: boolean }) => {
  const { fileList, setFileList } = useContext(FileListContext);
  const [fileList_, setFileList_] = useState([] as FILE[]);
  const { user } = useAuth();

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
      let filteredFiles = fileList;
      
      if (isPrivateOnly) {
        // Show ONLY archived files that are marked private
        filteredFiles = filteredFiles.filter((file: FILE) => file.archieved && file.isPrivate);
      } else if (isArchive) {
        // Show archived files that are NOT marked private
        filteredFiles = filteredFiles.filter((file: FILE) => file.archieved && !file.isPrivate);
      } else {
        // Main Dashboard: Show only active (non-archived) files
        filteredFiles = filteredFiles.filter((file: FILE) => !file.archieved);
      }
      
      setFileList_(filteredFiles);
    }
  }, [fileList, isArchive, isPrivateOnly]);

  const handleArchive = (id: string, isCurrentlyArchived: boolean) => {
    if (isCurrentlyArchived) {
      unarchiveFile({ _id: id as Id<"files"> }).then((res) => {
        toast.success("File unarchived successfully");
        setFileList(fileList.map((file: any) => file._id === id ? { ...file, archieved: false, isPrivate: false } : file));
      }).catch((err) => {
        toast.error("Error unarchiving file");
      });
    } else {
      archiveFile({ _id: id as Id<"files"> }).then((res) => {
        toast.success("File archived successfully");
        setFileList(fileList.map((file: any) => file._id === id ? { ...file, archieved: true } : file));
      }).catch((err) => {
        toast.error("Error archiving file");
      });
    }
  };

  const handleTogglePrivacy = (id: string, currentPrivacy: boolean) => {
    toggleFilePrivacy({
      _id: id as Id<"files">,
      isPrivate: !currentPrivacy
    }).then(() => {
      const msg = !currentPrivacy ? "Added to Private Files" : "Removed from Private Files";
      toast.success(msg);
      setFileList(fileList.map((file: any) => 
        file._id === id ? { ...file, isPrivate: !currentPrivacy } : file
      ));
    }).catch((err) => {
      toast.error("Error updating file privacy");
    });
  };

  const handleDelete = (id: string) => {
    const loadingToast = toast.loading("Deleting file...");
    deleteFile({ _id: id as Id<"files"> }).then((res) => {
      toast.dismiss(loadingToast);
      toast.success("File deleted successfully");
      const updatedList = fileList.filter((file: any) => file._id !== id);
      setFileList(updatedList);
    }).catch((err) => {
      toast.dismiss(loadingToast);
      toast.error("Error deleting file: " + (err.message || "Unknown error"));
    });
  };

  const handleRename = () => {
    if (!selectedFile || !newFileName.trim()) return;

    const loadingToast = toast.loading("Updating file name...");
    updateFileName({
      _id: selectedFile._id as Id<"files">,
      fileName: newFileName.trim()
    }).then(() => {
      toast.dismiss(loadingToast);
      toast.success("File renamed successfully");
      setFileList(fileList.map((file: any) => 
        file._id === selectedFile._id ? { ...file, fileName: newFileName.trim() } : file
      ));
      setIsRenameDialogOpen(false);
    }).catch((err) => {
      toast.dismiss(loadingToast);
      toast.error("Error renaming file");
    });
  };

  const router = useRouter();

  return (
    <div className="mt-8 px-4 sm:px-10">
      <div className="overflow-x-auto w-full rounded-lg border border-border/50">
        <Table className="min-w-[700px] sm:min-w-full">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="hidden md:table-cell font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Author</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
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
                  className="hover:bg-accent/50 cursor-pointer border-border hover:text-accent-foreground transition-colors group"
                >
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {file.fileName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                    {file.teamName || "Project"}
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex items-center">
                      <TooltipProvider>
                        {file.contributors && file.contributors.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 overflow-hidden">
                              {file.contributors.map((contributor, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <img
                                      src={contributor.image}
                                      alt={contributor.name}
                                      className={cn(
                                        "inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover cursor-pointer hover:z-10 transition-all",
                                        index === 0 ? "z-0" : `z-${index * 10}`
                                      )}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{contributor.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                            {file.contributors.length === 1 && (
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {file.contributors[0].name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <img
                              src="https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais"
                              alt="logo"
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="text-xs text-muted-foreground">User</span>
                          </div>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                    {moment(file._creationTime).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="outline-none">
                        <div 
                          className="p-2 hover:bg-muted w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-colors" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border w-48 shadow-xl">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setNewFileName(file.fileName);
                            setIsRenameDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(file._id, file.archieved);
                          }}
                        >
                          <Archive size={16} />
                          {file.archieved ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>

                        {file.archieved && (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePrivacy(file._id, !!file.isPrivate);
                            }}
                          >
                            <LucideLock size={16} />
                            {file.isPrivate ? "Remove from Private" : "Make Private"}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file._id);
                          }}
                        >
                          <Delete size={16} />
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
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
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
