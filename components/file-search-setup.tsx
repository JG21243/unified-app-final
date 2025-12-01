"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useToolsStore from "@/stores/useToolsStore";
import FileUpload from "@/components/file-upload";
import { Input } from "./ui/input";
import { CircleX, Info, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

type VectorStoreFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt?: number;
  status?: string;
};

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
};

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [newStoreId, setNewStoreId] = useState<string>("");
  const [files, setFiles] = useState<VectorStoreFile[]>([]);
  const [storeDetails, setStoreDetails] = useState(vectorStore || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actioningFile, setActioningFile] = useState<string | null>(null);
  const [storeMessage, setStoreMessage] = useState<string | null>(null);

  const hasVectorStore = useMemo(() => Boolean(vectorStore?.id), [vectorStore?.id]);

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
    setFiles([]);
    setStoreDetails(null);
    setStoreMessage("Choose or create a vector store to manage files.");
  };

  const fetchStoreData = useCallback(
    async (storeId: string, query?: string) => {
      setLoading(true);
      setError(null);
      try {
        const [storeRes, filesRes] = await Promise.all([
          fetch(`/api/vector_stores/retrieve_store?vector_store_id=${storeId}`),
          fetch(
            `/api/vector_stores/list_files?vector_store_id=${storeId}${
              query ? `&q=${encodeURIComponent(query)}` : ""
            }`
          ),
        ]);

        const storeJson = await storeRes.json();
        if (storeRes.ok && storeJson.id) {
          setStoreDetails(storeJson);
          setVectorStore((prev) =>
            prev?.id === storeId ? { ...prev, ...storeJson } : storeJson
          );
        } else if (!storeRes.ok) {
          setError(storeJson.error || "Unable to load vector store details.");
        }

        const filesJson = await filesRes.json();
        if (filesRes.ok) {
          setFiles(filesJson.data || []);
        } else {
          setError(filesJson.error || "Unable to load files for this store.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load vector store files."
        );
      } finally {
        setLoading(false);
      }
    },
    [setVectorStore]
  );

  const handleAddStore = async (storeId: string) => {
    const trimmedId = storeId.trim();
    if (!trimmedId) {
      setStoreMessage("Pick an existing store ID or create one before linking.");
      return;
    }
    setStoreMessage(null);
    const newStore = await fetch(
      `/api/vector_stores/retrieve_store?vector_store_id=${trimmedId}`
    ).then((res) => res.json());
    if (newStore.id) {
      setVectorStore(newStore);
      setStoreDetails(newStore);
      fetchStoreData(trimmedId, searchTerm);
    } else {
      setStoreMessage("Vector store not found. Double-check the ID.");
    }
  };

  useEffect(() => {
    if (!vectorStore?.id) {
      setFiles([]);
      return undefined;
    }

    setStoreMessage(null);
    const debounce = setTimeout(() => {
      fetchStoreData(vectorStore.id, searchTerm);
    }, 300);

    return () => clearTimeout(debounce);
  }, [vectorStore?.id, searchTerm, fetchStoreData]);

  const handleDeleteFile = async (fileId: string) => {
    if (!vectorStore?.id) return;
    setActioningFile(fileId);
    try {
      const res = await fetch(`/api/vector_stores/manage_file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vectorStoreId: vectorStore.id,
          fileId,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Unable to delete file.");
      }
      fetchStoreData(vectorStore.id, searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete file.");
    } finally {
      setActioningFile(null);
    }
  };

  const handleRefreshFile = async (fileId: string) => {
    if (!vectorStore?.id) return;
    setActioningFile(fileId);
    try {
      const res = await fetch(`/api/vector_stores/manage_file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vectorStoreId: vectorStore.id,
          fileId,
          action: "refresh",
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Unable to refresh file.");
      }
      fetchStoreData(vectorStore.id, searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh file.");
    } finally {
      setActioningFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-500">
        Upload a file to create a new vector store, or use an existing one. Each
        upload is limited to 25MB and may take a moment to finish ingestion.
      </div>
      <div className="flex items-center gap-2 mt-2 h-10">
        <div className="flex items-center gap-2 w-full">
          <div className="text-sm font-medium w-24 text-nowrap">Vector store</div>
          {hasVectorStore ? (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-zinc-400 text-xs font-mono flex-1 text-ellipsis truncate">
                  {vectorStore?.id}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleX
                        onClick={() => unlinkStore()}
                        size={16}
                        className="cursor-pointer text-zinc-400 mb-0.5 shrink-0 mt-0.5 hover:text-zinc-700 transition-all"
                        aria-label="Unlink vector store"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="mr-2">
                      <p>Unlink vector store</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="ID (vs_XXXX...)"
                value={newStoreId}
                onChange={(e) => setNewStoreId(e.target.value)}
                className="border border-zinc-300 rounded text-sm bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStore(newStoreId);
                  }
                }}
              />
              <div
                className="text-zinc-400 text-sm px-1 transition-colors hover:text-zinc-600 cursor-pointer"
                onClick={() => handleAddStore(newStoreId)}
              >
                Add
              </div>
            </div>
          )}
        </div>
      </div>
      {storeMessage && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {storeMessage}
        </div>
      )}
      <div className="flex mt-4">
        <FileUpload
          vectorStoreId={vectorStore?.id ?? ""}
          vectorStoreName={vectorStore?.name ?? ""}
          onAddStore={(id) => handleAddStore(id)}
          onUnlinkStore={() => unlinkStore()}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-2">
          <Info className="text-indigo-500" size={18} />
          <div>
            <div className="font-semibold text-sm">Vector Store Explorer</div>
            <div className="text-xs text-zinc-500">
              Track ingestion status, browse files, and manage your knowledge base.
            </div>
          </div>
        </div>

        {!hasVectorStore ? (
          <div className="mt-4 text-sm text-zinc-500">
            Link a vector store or upload a file to create one before exploring its
            contents.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-800">
                  {storeDetails?.name || "Unnamed store"}
                </div>
                <div className="text-xs text-zinc-500 break-all">
                  ID: {storeDetails?.id || vectorStore?.id}
                </div>
                <div className="text-xs text-zinc-500">
                  Files: {files.length} • Each upload must be under 25MB
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input
                  placeholder="Search by file name or type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
                <button
                  className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => fetchStoreData(vectorStore?.id || "", searchTerm)}
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <div className="text-xs text-zinc-600 bg-indigo-50 border border-indigo-100 rounded px-3 py-2">
              Ingestion statuses may show as processing briefly after upload. Refresh
              to see updated states. Files larger than 25MB are rejected before
              ingestion starts.
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
                <div className="col-span-5">File</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Added</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-zinc-500">
                  <Loader2 className="animate-spin" size={16} /> Loading files...
                </div>
              ) : files.length === 0 ? (
                <div className="px-3 py-4 text-sm text-zinc-500">
                  No files linked to this store yet.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 gap-2 border-t border-zinc-100 px-3 py-3 text-sm items-center"
                  >
                    <div className="col-span-5">
                      <div className="font-medium text-zinc-800 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Status: {file.status || "pending"}
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-zinc-600 truncate">
                      {file.type}
                    </div>
                    <div className="col-span-2 text-xs text-zinc-600">
                      {formatBytes(file.size)}
                    </div>
                    <div className="col-span-2 text-xs text-zinc-600 truncate">
                      {formatTimestamp(file.createdAt)}
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50"
                        onClick={() => handleRefreshFile(file.id)}
                        disabled={actioningFile === file.id}
                        aria-label="Refresh file embeddings"
                      >
                        {actioningFile === file.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <RefreshCcw size={16} className="text-zinc-600" />
                        )}
                      </button>
                      <button
                        className="p-1.5 rounded-md border border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={actioningFile === file.id}
                        aria-label="Delete file from vector store"
                      >
                        {actioningFile === file.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} className="text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
