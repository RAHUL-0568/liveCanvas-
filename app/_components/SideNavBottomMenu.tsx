import React, { useState } from "react";
import {
  ArchiveIcon,
  LucideLock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface SideNavBottomMenuProps {
  onFileCreate: (fileName: string) => void;
  length: number;
}

const SideNavBottomMenu = ({ onFileCreate, length }: SideNavBottomMenuProps) => {
  const menuList = [
    {
      id: 3,
      name: "Private Files",
      icon: LucideLock,
      link: "/dashboard/private",
    },
    {
      id: 4,
      name: "Archive",
      icon: ArchiveIcon,
      link: "/dashboard/archive",
    },
  ];

  const [fileName, setFileName] = useState("Untitled File");

  const router = useRouter();

  return (
    <div className="px-3">
      {menuList.map((item) => (
        <div
          key={item.id}
          onClick={() => router.push(item.link)}
          className="flex space-x-2 text-muted-foreground cursor-pointer items-center justify-start hover:bg-accent hover:text-accent-foreground text-sm px-2 font-semibold py-2 rounded-lg transition-colors"
        >
          <item.icon size={16} className="mr-2" />
          {item.name}
        </div>
      ))}

      {/* add new file btn */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full mt-6 mb-4 justify-start font-medium bg-primary text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            New File
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-popover text-popover-foreground border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>
              Create New File
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new file to start working with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                File Name
              </Label>
              <Input
                id="name"
                defaultValue={fileName}
                className="col-span-3 border-border bg-transparent focus-visible:ring-primary"
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => onFileCreate(fileName)}
                disabled={!fileName}
                type="submit"
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                Create File
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* progress */}
      <div className="space-y-2 mb-4">
        <Progress value={length * 20} className="h-1.5" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground">{length}</span> out of{" "}
          <span className="font-bold text-foreground">5</span> files used.
        </p>
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-primary cursor-pointer hover:underline transition-all">Upgrade</span>{" "}
          for unlimited access.
        </p>
      </div>
    </div>
  );
};

export default SideNavBottomMenu;
