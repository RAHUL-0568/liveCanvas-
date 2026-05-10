import { createContext, Dispatch, SetStateAction } from "react";

export interface Team {
  _id: string;
  teamName: string;
  createdBy: string;
}

interface FileListContextType {
  fileList: any[];
  setFileList: Dispatch<SetStateAction<any[]>>;
  activeTeam: Team | undefined;
  setActiveTeam: Dispatch<SetStateAction<Team | undefined>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const FileListContext = createContext<any>(undefined);
