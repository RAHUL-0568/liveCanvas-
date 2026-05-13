"use client";
import React, { useEffect, useRef, useState } from "react";
import EditorJs from "@editorjs/editorjs";
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import checkList from "@editorjs/checklist";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { FILE } from "../../dashboard/_components/DashboardTable";
import { useAuth } from "@/hooks/useAuth";

const rawDocument = {
  time: 1550476186479,
  blocks: [
    {
      id: "oUq2g_tl8y",
      type: "header",
      data: {
        text: "Untitled Document",
        level: 2,
      },
    },
  ],
  version: "2.8.1",
};

const Editor = ({
  onSaveTrigger,
  fileId,
  fileData,
}: {
  onSaveTrigger: any;
  fileId: any;
  fileData: FILE;
}) => {
  const { user } = useAuth();
  const ref = useRef<EditorJs | null>(null);
  const [document, setDocument] = useState(rawDocument);
  const { resolvedTheme } = useTheme();
  const editorInitializedRef = useRef(false);

  const updateDocument = useMutation(api.files.updateDocument);

  const initEditor = async () => {
    // Clean up old instance
    if (ref.current) {
      try {
        await ref.current.destroy();
      } catch (e) {
        console.error("Error destroying editor:", e);
      }
      ref.current = null;
    }

    const editor = new EditorJs({
      holder: "editorjs",
      placeholder: "Let`s write an awesome story!",
      tools: {
        header: {
          // @ts-ignore
          class: Header,
          inlineToolbar: true,
          shortcut: "CMD+SHIFT+H",
          placeholder: "Enter a heading",
        },
        list: List,
        checklist: checkList,
      },
      data: fileData.document ? JSON.parse(fileData.document) : document,
      onChange: () => {
        handleAutoSave();
      }
    });

    try {
      await editor.isReady;
      ref.current = editor;
      editorInitializedRef.current = true;
    } catch (e) {
      console.error("Error initializing editor:", e);
    }
  };

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      onDocumentSave(true);
    }, 2000);
  };

  // Initialize editor only once per file
  useEffect(() => {
    if (fileData && !editorInitializedRef.current) {
      initEditor();
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (ref.current) {
        try {
          ref.current.destroy();
        } catch (e) {
          console.error("Error destroying editor:", e);
        }
        ref.current = null;
      }
    };
  }, [fileId]); // Only reinit on fileId change, not on every fileData update

  useEffect(() => {
    if (onSaveTrigger !== undefined && onSaveTrigger !== null) {
      onDocumentSave(false);
    }
  }, [onSaveTrigger]);

  const onDocumentSave = async (isAutoSave = false) => {
    if (ref.current) {
      try {
        const savedData = await ref.current.save();
        
        // Don't save if there's no content change for auto-saves
        const documentJson = JSON.stringify(savedData);
        
        await updateDocument({
          _id: fileId,
          document: documentJson,
          contributor: user?.email || undefined,
        });
        
        toast.success(isAutoSave ? "Auto-saved" : "Document Saved");
      } catch (e) {
        console.error("Error saving document:", e);
        if (!isAutoSave) toast.error("Failed to save document");
      }
    }
  };

  return (
    <div className="p-2">
      <div
        className="selection:bg-primary selection:text-primary-foreground overflow-x-hidden overflow-y-auto w-full pr-4 pl-10 h-[85vh] mb-4 text-foreground"
        id="editorjs"
      ></div>
    </div>
  );
};

export default Editor;
