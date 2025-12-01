import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultVectorStore } from "@/config/constants";
import type { ToolPresetPayload } from "@/lib/validations/tools-preset";

export type File = {
  id: string;
  name: string;
  content: string;
};

export type VectorStore = {
  id: string;
  name?: string;
  files?: File[];
  config?: Record<string, unknown>;
};

export type WebSearchConfig = {
  user_location?: {
    type: "approximate";
    country?: string;
    city?: string;
    region?: string;
  };
};

export type ToolPreset = ToolPresetPayload & {
  id: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: string | null;
};

const DEFAULT_WEB_SEARCH_CONFIG: WebSearchConfig = {
  user_location: {
    type: "approximate",
    country: "",
    city: "",
    region: "",
  },
};

interface StoreState {
  fileSearchEnabled: boolean;
  setFileSearchEnabled: (enabled: boolean) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  functionsEnabled: boolean;
  setFunctionsEnabled: (enabled: boolean) => void;
  vectorStore: VectorStore | null;
  setVectorStore: (store: VectorStore | null) => void;
  webSearchConfig: WebSearchConfig;
  setWebSearchConfig: (config: WebSearchConfig) => void;
  presets: ToolPreset[];
  presetsStatus: "idle" | "loading" | "error";
  activePresetId: string | null;
  lastUsedPresetId: string | null;
  loadPresets: (applyLastUsed?: boolean) => Promise<void>;
  savePreset: (
    name: string,
    options?: { makePublic?: boolean; workspaceId?: string | null }
  ) => Promise<ToolPreset | null>;
  updatePreset: (id: string, data: Partial<Omit<ToolPreset, "id">>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  applyPresetById: (presetId: string) => Promise<void>;
  setActivePresetId: (presetId: string | null) => void;
}

const buildPresetPayload = (state: StoreState, name: string, options?: { makePublic?: boolean; workspaceId?: string | null }) => {
  return {
    name,
    fileSearchEnabled: state.fileSearchEnabled,
    webSearchEnabled: state.webSearchEnabled,
    functionsEnabled: state.functionsEnabled,
    vectorStore: state.vectorStore,
    webSearchConfig: state.webSearchConfig,
    isPublic: options?.makePublic ?? false,
    workspaceId: options?.workspaceId ?? null,
  } satisfies ToolPresetPayload;
};

const useToolsStore = create<StoreState>()(
  persist(
    (set, get) => ({
      vectorStore:
        defaultVectorStore.id !== "" ? { ...defaultVectorStore, config: {} } : null,
      webSearchConfig: DEFAULT_WEB_SEARCH_CONFIG,
      fileSearchEnabled: false,
      webSearchEnabled: false,
      functionsEnabled: true,
      presets: [],
      presetsStatus: "idle",
      activePresetId: null,
      lastUsedPresetId: null,
      setFileSearchEnabled: (enabled) => {
        set({ fileSearchEnabled: enabled });
      },
      setWebSearchEnabled: (enabled) => {
        set({ webSearchEnabled: enabled });
      },
      setFunctionsEnabled: (enabled) => {
        set({ functionsEnabled: enabled });
      },
      setVectorStore: (store) => set({ vectorStore: store }),
      setWebSearchConfig: (config) => set({ webSearchConfig: config }),
      loadPresets: async (applyLastUsed = false) => {
        set({ presetsStatus: "loading" });
        try {
          const response = await fetch("/api/tools-presets");
          if (!response.ok) throw new Error("Unable to load presets");
          const data = await response.json();
          const presets: ToolPreset[] = data.presets ?? [];

          set((state) => {
            const existingActive = presets.find((preset) => preset.id === state.activePresetId)
              ? state.activePresetId
              : null;
            const lastUsedId =
              state.lastUsedPresetId ??
              presets.find((preset) => preset.lastUsedAt)?.id ??
              existingActive;

            return {
              presets,
              presetsStatus: "idle",
              activePresetId: existingActive,
              lastUsedPresetId: lastUsedId ?? null,
            };
          });

          if (applyLastUsed) {
            const targetId =
              get().activePresetId ??
              get().lastUsedPresetId ??
              presets.find((preset) => preset.lastUsedAt)?.id ??
              presets[0]?.id;
            if (targetId) {
              await get().applyPresetById(targetId);
            }
          }
        } catch (error) {
          console.error(error);
          set({ presetsStatus: "error" });
        }
      },
      savePreset: async (name, options) => {
        try {
          const payload = buildPresetPayload(get(), name, options);
          const response = await fetch("/api/tools-presets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error("Unable to save preset");
          const { preset } = await response.json();
          set((state) => ({
            presets: [preset, ...state.presets.filter((item) => item.id !== preset.id)],
            activePresetId: preset.id,
            lastUsedPresetId: preset.id,
          }));
          return preset;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
      updatePreset: async (id, data) => {
        try {
          const response = await fetch(`/api/tools-presets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) throw new Error("Unable to update preset");
          const { preset } = await response.json();
          set((state) => ({
            presets: state.presets.map((item) => (item.id === id ? { ...item, ...preset } : item)),
          }));
        } catch (error) {
          console.error(error);
        }
      },
      deletePreset: async (id) => {
        try {
          await fetch(`/api/tools-presets/${id}`, { method: "DELETE" });
          set((state) => ({
            presets: state.presets.filter((item) => item.id !== id),
            activePresetId: state.activePresetId === id ? null : state.activePresetId,
            lastUsedPresetId: state.lastUsedPresetId === id ? null : state.lastUsedPresetId,
          }));
        } catch (error) {
          console.error(error);
        }
      },
      applyPresetById: async (presetId) => {
        let preset = get().presets.find((item) => item.id === presetId);

        if (!preset) {
          try {
            const response = await fetch(`/api/tools-presets/${presetId}`);
            if (response.ok) {
              const data = await response.json();
              preset = data.preset as ToolPreset;
              set((state) => ({ presets: [preset!, ...state.presets] }));
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (!preset) return;

        set({
          fileSearchEnabled: preset.fileSearchEnabled,
          webSearchEnabled: preset.webSearchEnabled,
          functionsEnabled: preset.functionsEnabled,
          vectorStore: preset.vectorStore ?? null,
          webSearchConfig: preset.webSearchConfig ?? DEFAULT_WEB_SEARCH_CONFIG,
          activePresetId: presetId,
          lastUsedPresetId: presetId,
        });

        try {
          await fetch(`/api/tools-presets/${presetId}`, { method: "POST" });
        } catch (error) {
          console.error(error);
        }
      },
      setActivePresetId: (presetId) => set({ activePresetId: presetId }),
    }),
    {
      name: "tools-store",
      partialize: (state) => ({
        fileSearchEnabled: state.fileSearchEnabled,
        webSearchEnabled: state.webSearchEnabled,
        functionsEnabled: state.functionsEnabled,
        vectorStore: state.vectorStore,
        webSearchConfig: state.webSearchConfig,
        presets: state.presets,
        activePresetId: state.activePresetId,
        lastUsedPresetId: state.lastUsedPresetId,
      }),
    }
  )
);

export default useToolsStore;
