"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Plus, Database, CheckCircle2, AlertCircle } from "lucide-react";
import useToolsStore from "@/stores/useToolsStore";

interface VectorStoreSummary {
  id: string;
  name?: string;
  status?: string;
  file_counts?: {
    cancelled: number;
    completed: number;
    failed: number;
    in_progress: number;
    total: number;
  };
}

const formatStatus = (status?: string) => {
  if (!status) return "unknown";
  return status.replace(/_/g, " ");
};

const formatName = (name?: string, fallbackId?: string) => {
  if (name && name.trim() !== "") return name;
  if (!fallbackId) return "Untitled";
  return `Store ${fallbackId.slice(0, 6)}`;
};

export default function VectorStoreManager() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [stores, setStores] = useState<VectorStoreSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState("New vector store");

  const activeStoreId = vectorStore?.id ?? "";

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === (selectedStoreId || activeStoreId)),
    [stores, selectedStoreId, activeStoreId]
  );

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/vector_stores/list_stores");
      if (!response.ok) {
        throw new Error("Unable to load vector stores");
      }
      const data = await response.json();
      setStores(data?.data ?? []);
    } catch (err) {
      console.error("Failed to load vector stores", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch vector stores right now"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const activateStore = async (storeId: string) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/vector_stores/retrieve_store?vector_store_id=${storeId}`
      );
      if (!response.ok) {
        throw new Error("Unable to load selected store");
      }
      const store = await response.json();
      setVectorStore({
        id: store.id,
        name: store.name ?? formatName(store.name, store.id),
        files: [],
      });
    } catch (err) {
      console.error("Error activating store", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to set the selected store as active"
      );
    }
  };

  const handleCreateStore = async () => {
    try {
      setCreating(true);
      setError(null);
      const response = await fetch("/api/vector_stores/create_store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStoreName || "New vector store" }),
      });

      if (!response.ok) {
        throw new Error("Unable to create a new vector store");
      }

      const store = await response.json();
      setVectorStore({
        id: store.id,
        name: store.name ?? formatName(store.name, store.id),
        files: [],
      });
      setSelectedStoreId(store.id);
      await loadStores();
    } catch (err) {
      console.error("Error creating store", err);
      setError(
        err instanceof Error ? err.message : "There was an issue creating the store"
      );
    } finally {
      setCreating(false);
    }
  };

  const clearStore = () => {
    setVectorStore({ id: "", name: "" });
    setSelectedStoreId("");
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
              Vector stores
            </CardTitle>
            <CardDescription>
              Choose an existing store or create a new one to link with the assistant.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadStores}
            aria-label="Refresh vector stores"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">Active store</div>
            {activeStoreId && (
              <Button variant="ghost" size="sm" onClick={clearStore}>
                Unlink
              </Button>
            )}
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/60">
            {activeStoreId ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatName(vectorStore?.name, activeStoreId)}</Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activeStoreId}</span>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No store linked</div>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>Select a store</span>
            {selectedStore && (
              <Badge variant="outline" className="capitalize">
                {formatStatus(selectedStore.status)}
              </Badge>
            )}
          </div>
          <Select
            value={selectedStoreId || activeStoreId}
            onValueChange={(value) => setSelectedStoreId(value)}
            disabled={loading || stores.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                loading ? "Loading stores..." : "Choose an existing store"
              } />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{formatName(store.name, store.id)}</span>
                    <span className="text-xs text-muted-foreground">{store.file_counts?.total ?? 0} files • {formatStatus(store.status)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stores.length === 0
                ? "No stores found yet. Create one to get started."
                : "Use the selected store for uploads and search."}
            </div>
            <Button
              size="sm"
              onClick={() => activateStore(selectedStoreId || activeStoreId)}
              disabled={!selectedStoreId && !activeStoreId}
            >
              Set active
            </Button>
          </div>
        </div>

        {selectedStore && (
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/60">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {formatStatus(selectedStore.status)}
              </Badge>
              <span className="text-xs text-gray-500">{selectedStore.id}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-3">
              <div>
                <div className="font-semibold">Total</div>
                <div>{selectedStore.file_counts?.total ?? 0}</div>
              </div>
              <div>
                <div className="font-semibold">In progress</div>
                <div>{selectedStore.file_counts?.in_progress ?? 0}</div>
              </div>
              <div>
                <div className="font-semibold">Completed</div>
                <div>{selectedStore.file_counts?.completed ?? 0}</div>
              </div>
              <div>
                <div className="font-semibold">Failed</div>
                <div>{selectedStore.file_counts?.failed ?? 0}</div>
              </div>
              <div>
                <div className="font-semibold">Cancelled</div>
                <div>{selectedStore.file_counts?.cancelled ?? 0}</div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>Create a new store</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Plus size={14} />
              Auto-link
            </Badge>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Give your store a friendly name"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
            />
            <Button onClick={handleCreateStore} disabled={creating}>
              {creating ? "Creating..." : "Create & set active"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            New stores are linked automatically so uploads use the latest selection.
          </p>
        </div>

        {selectedStore && activeStoreId === selectedStore.id && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 size={16} />
            <span>{formatName(selectedStore.name, selectedStore.id)} is active.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
