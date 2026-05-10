"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  (window as any).EXCALIDRAW_ASSET_PATH = "/";
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
  const [whiteBoard, setWhiteBoard] = useState<any>();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { resolvedTheme } = useTheme();
  const canvasTheme: "light" | "dark" =
    resolvedTheme === "dark" ? "dark" : "light";

  // useRef avoids triggering re-renders when the API is set,
  // which previously caused infinite update loops
  const excalidrawAPIRef = useRef<any>(null);
  const onExcalidrawAPI = useCallback((api: any) => {
    excalidrawAPIRef.current = api;
  }, []);

  const searchParams = useSearchParams();
  const isImportingRef = useRef(false);
  const lastSavedWhiteboardRef = useRef<string>("");
  const isFirstSyncRef = useRef(true);

  // Helper to load library from localStorage into Excalidraw
  const applyLibraryFromStorage = useCallback(async () => {
    if (!excalidrawAPIRef.current) return;
    
    try {
      const stored = localStorage.getItem('excalidraw-library');
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = parsed.libraryItems || parsed.library || [];

        if (Array.isArray(items) && items.length > 0) {
          await excalidrawAPIRef.current.updateLibrary({
            libraryItems: items,
            prompt: false, // Don't prompt user to confirm
            merge: false,  // We are providing the full list from storage
          });
        }
      }
    } catch (err) {
      console.error("Error applying library from storage:", err);
    }
  }, []);

  // Listen for storage changes to sync library across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'excalidraw-library') {
        applyLibraryFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyLibraryFromStorage]);

  // Subscribe to real-time file updates (for multi-user sync)
  const liveFileData = useQuery(api.files.getFilebyId, { _id: fileId });
  const savedImages = useQuery(api.excalidrawFiles.getFiles, { fileId });
  const addExcalidrawFile = useMutation(api.excalidrawFiles.addFile);
  const updateWhiteBoard = useMutation(api.files.updateWhiteboard);

  // Sync images from backend to Excalidraw
  useEffect(() => {
    if (savedImages && savedImages.length > 0 && excalidrawAPIRef.current) {
      const formattedFiles: any[] = savedImages.map((f: any) => ({
        id: f.excalidrawFileId,
        dataURL: f.dataURL,
        mimeType: f.mimeType,
        created: f.created,
        status: "saved",
      }));
      
      // Delay slightly to ensure elements are ready
      setTimeout(() => {
        excalidrawAPIRef.current.addFiles(formattedFiles);
      }, 500);
    }
  }, [savedImages]);

  // Update lastSaveTime whenever liveFileData changes
  useEffect(() => {
    if (liveFileData?._ts) {
      setLastSaveTime(new Date(liveFileData._ts));
    }
  }, [liveFileData?._ts]);


  // Load saved library on mount
  useEffect(() => {
    const initLibrary = async () => {
        // Wait for API to be ready
        let retries = 0;
        while (!excalidrawAPIRef.current && retries < 50) {
          await new Promise(r => setTimeout(r, 100));
          retries++;
        }

        if (excalidrawAPIRef.current) {
          await applyLibraryFromStorage();
        }
    };
    initLibrary();
  }, [applyLibraryFromStorage]);

  // Real-time sync: when another user updates the file, reload library AND canvas drawing
  useEffect(() => {
    if (!liveFileData || !excalidrawAPIRef.current) return;

    // Always sync on first load, then check if it's our own save
    if (!isFirstSyncRef.current && liveFileData.whiteboard === lastSavedWhiteboardRef.current) {
      return;
    }

    isFirstSyncRef.current = false;

    const syncCanvasFromFile = async () => {
      try {
        // Sync canvas drawing
        if (liveFileData.whiteboard) {
          try {
            const fullData = JSON.parse(liveFileData.whiteboard);
            const elementsToRestore = Array.isArray(fullData) ? fullData : fullData.elements || [];
            
            if (elementsToRestore.length > 0) {
              excalidrawAPIRef.current.updateScene({ elements: elementsToRestore });
            }
          } catch (parseErr) {
            console.error("Error parsing canvas data:", parseErr);
          }
        }

        // Sync library from local storage (it might have been updated by another tab or import)
        if (!isImportingRef.current) {
           await applyLibraryFromStorage();
        }
      } catch (e) {
        console.error("Error syncing canvas/library:", e);
      }
    };

    syncCanvasFromFile();
  }, [liveFileData, applyLibraryFromStorage]);

  // Handle "Add to Excalidraw" deep-link from libs.excalidraw.com
  useEffect(() => {
    const addLibraryParam = searchParams.get("addLibrary");
    if (!addLibraryParam || isImportingRef.current) return;

    const attemptImport = async () => {
      isImportingRef.current = true;
      
      // Poll until Excalidraw API is ready (mounted)
      let retries = 0;
      while (!excalidrawAPIRef.current && retries < 40) {
        await new Promise((r) => setTimeout(r, 200));
        retries++;
      }
      
      if (!excalidrawAPIRef.current) {
        toast.error("Canvas not ready. Please try again.");
        isImportingRef.current = false;
        return;
      }

      // Small additional delay to let Excalidraw internal library state settle
      await new Promise(r => setTimeout(r, 500));

      try {
        const proxyUrl = `/api/library-proxy?url=${encodeURIComponent(addLibraryParam)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Proxy fetch failed: ${res.status} ${errorText}`);
        }
        const data = await res.json();

        // Support both .excalidrawlib v1 (library) and v2 (libraryItems)
        let newItemsRaw: any[] = [];
        if (data.libraryItems && Array.isArray(data.libraryItems)) {
          newItemsRaw = data.libraryItems;
        } else if (data.library && Array.isArray(data.library)) {
          newItemsRaw = data.library;
        } else if (Array.isArray(data)) {
          newItemsRaw = data;
        } else if (data.elements && Array.isArray(data.elements)) {
          newItemsRaw = [data];
        }

        if (!newItemsRaw || newItemsRaw.length === 0) {
          toast.error("The selected library is empty or invalid.");
          isImportingRef.current = false;
          return;
        }

        // Standardize item structure
        const validatedNewItems = newItemsRaw
          .map((item: any, index: number) => {
            try {
              let elements = [];
              let itemId = item.id || `lib-item-${Date.now()}-${index}`;
              let itemName = item.name || `Imported Item ${index + 1}`;
              
              if (Array.isArray(item)) {
                elements = item;
              } else if (item?.elements && Array.isArray(item.elements)) {
                elements = item.elements;
              } else if (item?.id && item?.type) {
                elements = [item];
              } else {
                return null;
              }

              const validatedElements = elements
                .filter((el: any) => el && typeof el === 'object')
                .map((el: any) => ({
                    id: el.id || `el-${Date.now()}-${Math.random()}`,
                    type: el.type || "freedraw",
                    x: el.x ?? 0,
                    y: el.y ?? 0,
                    width: el.width ?? 100,
                    height: el.height ?? 100,
                    ...el,
                  }));

              if (validatedElements.length === 0) return null;

              return {
                id: itemId,
                name: itemName,
                elements: validatedElements,
                status: "published",
                created: Date.now(),
              };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        if (validatedNewItems.length === 0) {
          throw new Error("Failed to validate any items in the library.");
        }
        
        const excalidrawAPI = excalidrawAPIRef.current;

        // Read from localStorage
        let persistedItems: any[] = [];
        try {
          const stored = localStorage.getItem('excalidraw-library');
          if (stored) {
            const parsed = JSON.parse(stored);
            persistedItems = parsed.libraryItems || parsed.library || [];
          }
        } catch (e) {
          persistedItems = [];
        }

        const itemMap = new Map<string, any>();
        persistedItems.forEach((item: any) => {
          if (item?.id && item?.elements) itemMap.set(item.id, item);
        });

        validatedNewItems.forEach((item: any) => {
          if (item?.id) {
            itemMap.set(item.id, item); // Overwrite/Add
          }
        });

        const allItems = Array.from(itemMap.values());
        if (allItems.length > 0) {
          localStorage.setItem('excalidraw-library', JSON.stringify({
            libraryItems: allItems,
            version: 2,
            updatedAt: new Date().toISOString(),
          }));
          
          await excalidrawAPI.updateLibrary({ 
            libraryItems: allItems,
            prompt: false,
            openLibrary: true 
          });
          
          // Re-open library panel just in case
          setTimeout(() => {
            if (typeof excalidrawAPI.openLibrary === 'function') {
                excalidrawAPI.openLibrary();
            }
          }, 300);
        }

        toast.success(`Imported ${validatedNewItems.length} item(s). Total library size: ${allItems.length}`);

        // Clean up URL using Next.js router to update hooks correctly
        router.replace(pathname);

        // If this tab was opened via a redirect from the library site,
        // we can try to close it after a short delay since the original 
        // tab will now have synced via the 'storage' event.
        if (window.opener || window.history.length === 1) {
          setTimeout(() => {
            window.close();
          }, 1500);
        }
      } catch (err: any) {
        console.error("Library Import Error:", err);
        toast.error(`Library error: ${err.message || "Unknown error"}`);
      } finally {
        isImportingRef.current = false;
      }
    };

    attemptImport();
  }, [searchParams]);

  useEffect(() => {
    whiteBoard && saveWhiteboard();
  }, [onSaveTrigger]);

  const saveWhiteboard = (elements?: any) => {
    const dataToSave = elements || whiteBoard;
    if (!dataToSave) return;

    const whiteboardJson = JSON.stringify(dataToSave);
    lastSavedWhiteboardRef.current = whiteboardJson;
    
    // Also extract and save any new files (images)
    if (excalidrawAPIRef.current) {
      const currentFiles = excalidrawAPIRef.current.getFiles();
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
      })
      .catch((err) => {
        console.error("❌ Save error:", err);
      });
  };

  const libraryReturnUrl =
    typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
  const canvasActions = {
    export: false,
    loadScene: false,
    saveAsImage: false,
  } as const;

  const sharedProps = {
    excalidrawAPI: onExcalidrawAPI,
    libraryReturnUrl,
    UIOptions: {
      canvasActions,
    },
    onChange: (els: any) => {
      setWhiteBoard(els);
      // Auto-save when AI-generated elements are added
      const hasAINewElements = els.some((el: any) => el.id.startsWith("ai-") && !lastSavedWhiteboardRef.current.includes(el.id));
      if (hasAINewElements) {
        saveWhiteboard(els);
      }
    },
  };

  return (
    <div className="h-full w-full flex flex-col">
      {liveFileData && user && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
          ✏️ {user.displayName || "User"} is viewing • Last saved: {lastSaveTime ? lastSaveTime.toLocaleTimeString() : "Never"}
        </div>
      )}
      <div className="flex-1 relative">
      <AIPromptDialog getExcalidrawAPI={() => excalidrawAPIRef.current} />
      {fileData && fileData.whiteboard ? (
        <Excalidraw
          theme={canvasTheme}
          {...sharedProps}
          initialData={{ elements: JSON.parse(fileData.whiteboard) }}
        >
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
        </Excalidraw>
      ) : (
        <Excalidraw theme={canvasTheme} {...sharedProps}>
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
        </Excalidraw>
      )}
      </div>
    </div>
  );
};

export default Canvas;
