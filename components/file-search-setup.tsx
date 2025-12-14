"use client";
import React from "react";
import useToolsStore from "@/stores/useToolsStore";
import FileUpload from "@/components/file-upload";
import VectorStoreManager from "@/components/vector-store-manager";

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
  };

  const handleAddStore = async (store: { id: string; name?: string }) => {
    if (!store.id.trim()) return;

    const response = await fetch(
      `/api/vector_stores/retrieve_store?vector_store_id=${store.id}`
    );

    if (response.ok) {
      const newStore = await response.json();
      setVectorStore({
        id: newStore.id,
        name: newStore.name ?? store.name ?? "",
        files: newStore.files,
      });
      return;
    }

    // Fallback to linking with provided metadata
    setVectorStore({ id: store.id, name: store.name ?? "" });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-500">
        Upload a file to create a new vector store, or pick an existing one without
        memorizing IDs.
      </div>

      <VectorStoreManager />

      <div className="flex mt-2">
        <FileUpload
          vectorStoreId={vectorStore?.id ?? ""}
          vectorStoreName={vectorStore?.name ?? ""}
          onAddStore={(store) => handleAddStore(store)}
          onUnlinkStore={() => unlinkStore()}
        />
      </div>
    </div>
  );
}
