import { cn } from "@/lib/utils";
import { Search, Send, Menu } from "lucide-react";
import React, { useState, useContext } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileListContext } from "@/app/_context/FileListContext";

const DashboardHeader = ({ user }: any) => {
  const context = useContext(FileListContext);
  const setIsMobileMenuOpen = context?.setIsMobileMenuOpen;

  const menu = [
    {
      id: 1,
      name: "All",
    },
    {
      id: 2,
      name: "Recent",
    },
    {
      id: 3,
      name: "Created By Me",
    },
  ];

  const [selected, setSelected] = useState(1);
  return (
    <div className="w-full">
      <div className="px-4 sm:px-10 py-6 mt-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground sm:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-1 space-x-2 font-semibold text-sm overflow-x-auto pb-1 no-scrollbar">
            {menu.map((item, index) => (
              <div
                onClick={() => setSelected(item.id)}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-muted-foreground hover:text-foreground transition-colors",
                  selected === item.id &&
                    "bg-secondary border border-border text-foreground shadow-sm"
                )}
                key={index}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* search user and share */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="bg-secondary rounded-lg flex items-center border border-border flex-1 md:flex-initial">
            <Search size={16} className="ml-2 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search files..."
              className="bg-secondary text-foreground p-2 text-sm outline-none border-none focus:ring-0 w-full md:w-48"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="shrink-0">
                      <img
                        src={
                          user?.image ??
                          "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais"
                        }
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover cursor-pointer border border-border"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-1 bg-popover border-border outline-none">
                  <div className="text-popover-foreground text-xs px-2 py-1">
                    {user?.name || "User"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="bg-primary hover:bg-primary/90 cursor-pointer text-primary-foreground text-sm rounded-md flex items-center px-4 py-2 transition-colors shadow-sm whitespace-nowrap">
              <Send size={16} className="mr-2" />
              <span className="hidden sm:inline">Invite</span>
              <span className="sm:hidden text-xs">Invite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
