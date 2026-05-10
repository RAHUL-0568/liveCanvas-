"use client";
import React, { Suspense, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkSpaceHeader from "../_components/WorkSpaceHeader";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FILE } from "../../dashboard/_components/DashboardTable";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Editor = dynamic(() => import("../_components/Editor"), {
  ssr: false,
});

const Canvas = dynamic(() => import("../_components/Canvas"), {
  ssr: false,
});

const Workspace = ({ params }: any) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const addContributor = useMutation(api.files.addContributor);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading]);

  // Use Convex query hook instead of manual state
  const fileData = useQuery(api.files.getFilebyId, { _id: params.fileId });

  useEffect(() => {
    if (user?.email && fileData) {
      addContributor({
        _id: params.fileId,
        email: user.email,
      });
    }
  }, [user, fileData, params.fileId]);

  const Tabs = [
    {
      name: "Document",
    },
    {
      name: "Both",
    },
    {
      name: "Canvas",
    },
  ];

  const [activeTab, setActiveTab] = useState(Tabs[1].name);
  const [triggerSave, setTriggerSave] = useState(false);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) return null;

  return (
    <div className="overflow-hidden w-full">
      <WorkSpaceHeader
        Tabs={Tabs}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        onSave={() => setTriggerSave(!triggerSave)}
        file={fileData}
      />
      {activeTab === "Document" ? (
        <div
          style={{
            height: "calc(100vh - 3.5rem)",
          }}
        >
          {fileData ? (
            <Editor
              onSaveTrigger={triggerSave}
              fileId={params.fileId}
              fileData={fileData}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p>Loading...</p>
            </div>
          )}
        </div>
      ) : activeTab === "Both" ? (
        <div style={{ height: "calc(100vh - 3.5rem)" }}>
          {fileData ? (
            <ResizablePanelGroup direction="horizontal" style={{ height: "100%" }}>
              <ResizablePanel defaultSize={50} minSize={40} collapsible={false}>
                <Editor
                  onSaveTrigger={triggerSave}
                  fileId={params.fileId}
                  fileData={fileData}
                />
              </ResizablePanel>
              <ResizableHandle className=" bg-neutral-600" />
              <ResizablePanel defaultSize={50} minSize={45}>
                <Suspense fallback={null}>
                  <Canvas
                    onSaveTrigger={triggerSave}
                    fileId={params.fileId}
                    fileData={fileData}
                  />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p>Loading...</p>
            </div>
          )}
        </div>
      ) : activeTab === "Canvas" ? (
        <div
          style={{
            height: "calc(100vh - 3.5rem)",
          }}
        >
          {fileData ? (
            <Suspense fallback={null}>
              <Canvas
                onSaveTrigger={triggerSave}
                fileId={params.fileId}
                fileData={fileData}
              />
            </Suspense>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p>Loading...</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Workspace;
