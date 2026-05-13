import { createContext, Dispatch, SetStateAction } from "react";

export interface Team {
  _id: string;
  teamName: string;
  createdBy: string;
}

export type MenuType = "all" | "recent" | "created-by-me";

export interface Folder {
  _id: string;
  name: string;
  teamId: string;
  createdBy: string;
  _creationTime: number;
}

interface FileListContextType {
  fileList: any[];
  setFileList: Dispatch<SetStateAction<any[]>>;
  activeTeam: Team | undefined;
  setActiveTeam: Dispatch<SetStateAction<Team | undefined>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  selectedMenu: MenuType;
  setSelectedMenu: Dispatch<SetStateAction<MenuType>>;
  selectedFolder: Folder | undefined;
  setSelectedFolder: Dispatch<SetStateAction<Folder | undefined>>;
}

export const FileListContext = createContext<any>(undefined);
