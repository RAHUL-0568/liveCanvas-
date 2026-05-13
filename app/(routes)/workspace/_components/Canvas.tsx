"use client";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { FILE } from "../../dashboard/_components/DashboardTable";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AIPromptDialog from "./AIPromptDialog";

if (typeof window !== "undefined") {
  (window as any).EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
}

const Canvas = ({
  onSaveTrigger,
  fileId,
  fileData,
}: {
  onSaveTrigger: any;
  fileId: any;
  fileData: FILE;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { resolvedTheme } = useTheme();
  const canvasTheme: "light" | "dark" =
    resolvedTheme === "dark" ? "dark" : "light";

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const onExcalidrawAPI = useCallback((api: any) => {
    setExcalidrawAPI(api);
  }, []);

  // Library sync
  const applyLibraryFromStorage = useCallback(async () => {
    if (!excalidrawAPI) return;
    try {
      const stored = localStorage.getItem('excalidraw-library');
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = parsed.libraryItems || parsed.library || [];
        if (Array.isArray(items) && items.length > 0) {
          await excalidrawAPI.updateLibrary({
            libraryItems: items,
            prompt: false,
            merge: false,
          });
        }
      }
    } catch (err) {
      console.error("Error applying library from storage:", err);
    }
  }, [excalidrawAPI]);

  useEffect(() => {
    if (excalidrawAPI) {
      applyLibraryFromStorage();
    }
  }, [excalidrawAPI, applyLibraryFromStorage]);

  const searchParams = useSearchParams();
  const isImportingRef = useRef(false);

  // Handle library import from URL (?addLibrary=...)
  useEffect(() => {
    const addLibraryUrl = searchParams.get("addLibrary");
    if (addLibraryUrl && excalidrawAPI && !isImportingRef.current) {
      isImportingRef.current = true;
      console.log("Importing external library from:", addLibraryUrl);
      
      const importLibrary = async () => {
        try {
          const response = await fetch(`/api/library-proxy?url=${encodeURIComponent(addLibraryUrl)}`);
          if (!response.ok) throw new Error("Failed to fetch library via proxy");
          
          const data = await response.json();
          const libraryItems = data.libraryItems || data.library || [];
          
          if (libraryItems.length > 0) {
            await excalidrawAPI.updateLibrary({
              libraryItems,
              merge: true,
            });
            console.log(`Successfully imported ${libraryItems.length} library items`);
            
            // Save to localStorage so it persists
            const currentLibrary = localStorage.getItem('excalidraw-library');
            let newLibraryItems = libraryItems;
            if (currentLibrary) {
               try {
                 const parsed = JSON.parse(currentLibrary);
                 const existingItems = parsed.libraryItems || parsed.library || [];
                 newLibraryItems = [...existingItems, ...libraryItems];
               } catch (e) {}
            }
            localStorage.setItem('excalidraw-library', JSON.stringify({ libraryItems: newLibraryItems }));
          }
        } catch (error) {
          console.error("Library import error:", error);
        } finally {
          // Remove the parameter from URL without refreshing
          const url = new URL(window.location.href);
          url.searchParams.delete("addLibrary");
          window.history.replaceState({}, "", url.toString());
          isImportingRef.current = false;
        }
      };
      
      importLibrary();
    }
  }, [searchParams, excalidrawAPI]);
  const lastSavedWhiteboardRef = useRef<string>(fileData?.whiteboard || "");
  const whiteBoardRef = useRef<any>();
  const [isReady, setIsReady] = useState(false);

  // Use local query for fresh updates
  const liveFileData = useQuery(api.files.getFilebyId, { _id: fileId });
  const savedImages = useQuery(api.excalidrawFiles.getFiles, { fileId });
  const addExcalidrawFile = useMutation(api.excalidrawFiles.addFile);
  const updateWhiteBoard = useMutation(api.files.updateWhiteboard);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'excalidraw-library') applyLibraryFromStorage();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyLibraryFromStorage]);

  // Image sync
  useEffect(() => {
    if (savedImages && savedImages.length > 0 && excalidrawAPI) {
      const formattedFiles: any[] = savedImages.map((f: any) => ({
        id: f.excalidrawFileId,
        dataURL: f.dataURL,
        mimeType: f.mimeType,
        created: f.created,
        status: "saved",
      }));
      const timer = setTimeout(() => {
        excalidrawAPI.addFiles(formattedFiles);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [savedImages, excalidrawAPI]);

  // Sync state with database
  useEffect(() => {
    if (liveFileData?.whiteboard !== undefined && excalidrawAPI) {
      // If we haven't synced yet, or if DB changed remotely
      if (!isReady || (liveFileData.whiteboard !== lastSavedWhiteboardRef.current)) {
        try {
          const parsed = liveFileData.whiteboard ? JSON.parse(liveFileData.whiteboard) : [];
          
          let elements = [];
          let appState = {};

          if (Array.isArray(parsed)) {
            elements = parsed;
          } else if (parsed && typeof parsed === "object") {
            elements = parsed.elements || [];
            appState = parsed.appState || {};
          }

          excalidrawAPI.updateScene({ 
            elements,
            appState: {
              ...appState,
              theme: canvasTheme // Keep the theme handled by our state
            }
          });
          
          lastSavedWhiteboardRef.current = liveFileData.whiteboard || "";
          whiteBoardRef.current = elements;
        } catch (e) {
          console.error("Sync error:", e);
        }
        setIsReady(true);
      }
    }
  }, [liveFileData?.whiteboard, excalidrawAPI, isReady, canvasTheme]);

  const saveWhiteboard = useCallback((elements?: any, isAutoSave = false) => {
    // PROTECT: Don't save if not ready to avoid overwriting with empty state
    if (!isReady) return;

    let elementsToSave = elements;
    if (!elementsToSave && excalidrawAPI) {
      elementsToSave = excalidrawAPI.getSceneElements();
    }
    if (!elementsToSave) {
      elementsToSave = whiteBoardRef.current;
    }

    if (!elementsToSave || !Array.isArray(elementsToSave)) return;

    // Get current appState to save background color
    const appState = excalidrawAPI?.getAppState() || {};
    const sceneData = {
      elements: elementsToSave,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor
      }
    };

    const whiteboardJson = JSON.stringify(sceneData);
    
    // Only skip if it's an auto-save and nothing changed.
    if (isAutoSave && whiteboardJson === lastSavedWhiteboardRef.current) return;
    
    lastSavedWhiteboardRef.current = whiteboardJson;
    
    if (excalidrawAPI) {
      const currentFiles = excalidrawAPI.getFiles();
      Object.values(currentFiles).forEach((file: any) => {
        addExcalidrawFile({
          fileId,
          excalidrawFileId: file.id,
          dataURL: file.dataURL,
          mimeType: file.mimeType,
        });
      });
    }

    updateWhiteBoard({
      _id: fileId,
      whiteboard: whiteboardJson,
      contributor: user?.email || undefined,
    })
      .then(() => {
        setLastSaveTime(new Date());
        if (!isAutoSave || (elementsToSave && elementsToSave.some((el: any) => el.id.startsWith("ai-")))) {
           toast.success(isAutoSave ? "AI Changes Saved" : "Canvas Saved");
        }
      })
      .catch((err) => {
        console.error("❌ Save error:", err);
      });
  }, [excalidrawAPI, fileId, user?.email, addExcalidrawFile, updateWhiteBoard, isReady]);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback((elements?: any) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveWhiteboard(elements, true);
    }, 2000);
  }, [saveWhiteboard]);

  useEffect(() => {
    if (isReady) saveWhiteboard();
  }, [onSaveTrigger, saveWhiteboard, isReady]);

  const onChange = useCallback((els: any, state: any) => {
    if (!isReady) return;
    whiteBoardRef.current = els;
    
    // Check if elements or background color changed
    const lastSaved = lastSavedWhiteboardRef.current;
    let nothingChanged = false;
    try {
      if (lastSaved) {
        const parsed = JSON.parse(lastSaved);
        const lastElements = Array.isArray(parsed) ? parsed : (parsed.elements || []);
        const lastBg = Array.isArray(parsed) ? undefined : parsed.appState?.viewBackgroundColor;
        
        // Use a simple JSON stringify for a deep comparison check
        if (JSON.stringify(lastElements) === JSON.stringify(els) && lastBg === state.viewBackgroundColor) {
          nothingChanged = true;
        }
      }
    } catch (e) {}

    if (!nothingChanged) {
       const hasAINewElements = els.some((el: any) => el.id.startsWith("ai-") && !lastSaved.includes(el.id));
       if (hasAINewElements) {
         saveWhiteboard(els);
       } else {
         handleAutoSave(els);
       }
    }
  }, [saveWhiteboard, handleAutoSave, isReady]);

  // Unmount protection
  useEffect(() => {
    return () => {
      if (isReady && whiteBoardRef.current && whiteBoardRef.current.length > 0) {
        saveWhiteboard(whiteBoardRef.current);
      }
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [saveWhiteboard, isReady]);

  const canvasActions = useMemo(() => ({
    export: false,
    loadScene: false,
    saveAsImage: false,
  }), []);

  const libraryReturnUrl = useMemo(() => 
    typeof window !== "undefined" ? window.location.href.split("?")[0] : ""
  , []);

  const excalidrawChildren = useMemo(() => (
    <>
      <MainMenu>
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.DefaultItems.Help />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
      <WelcomeScreen>
        <WelcomeScreen.Hints.MenuHint />
        <WelcomeScreen.Hints.ToolbarHint />
        <WelcomeScreen.Hints.HelpHint />
      </WelcomeScreen>
    </>
  ), []);

  const getExcalidrawAPI = useCallback(() => excalidrawAPI, [excalidrawAPI]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveWhiteboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveWhiteboard]);

  // Initial Data for very first paint
  const initialData = useMemo(() => {
    if (fileData?.whiteboard) {
      try {
        const parsed = JSON.parse(fileData.whiteboard);
        if (Array.isArray(parsed)) {
          return { 
            elements: parsed,
            appState: { theme: canvasTheme }
          };
        } else {
          return {
            elements: parsed.elements || [],
            appState: { 
              ...parsed.appState,
              theme: canvasTheme 
            }
          };
        }
      } catch (e) {}
    }
    return { elements: [], appState: { theme: canvasTheme } };
  }, [fileData?.whiteboard, canvasTheme]);

  return (
    <div className="h-full w-full flex flex-col">
      {liveFileData && user && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
          ✏️ {user.displayName || "User"} is viewing • Last saved: {lastSaveTime ? lastSaveTime.toLocaleTimeString() : "Never"}
        </div>
      )}
      <div className="flex-1 relative">
        <AIPromptDialog getExcalidrawAPI={getExcalidrawAPI} />
        <Excalidraw
          theme={canvasTheme}
          excalidrawAPI={onExcalidrawAPI}
          libraryReturnUrl={libraryReturnUrl}
          UIOptions={{ canvasActions }}
          onChange={onChange}
          initialData={initialData}
        >
          {excalidrawChildren}
        </Excalidraw>
      </div>
    </div>
  );
};

export default Canvas;
