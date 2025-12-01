"use client";
import React, { useEffect, useMemo, useState } from "react";
import FileSearchSetup from "./file-search-setup";
import WebSearchConfig from "./websearch-config";
import FunctionsView from "./functions-view";
import PanelConfig from "./panel-config";
import useToolsStore from "@/stores/useToolsStore";
import {
  Database,
  Globe,
  Terminal,
  Sparkles,
  Share2,
  Link,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { toast } from "@/hooks/use-toast";

const WORKSPACE_OPTIONS = [
  { value: "legal", label: "Legal Ops" },
  { value: "product", label: "Product" },
  { value: "research", label: "Research" },
];

function PresetManager() {
  const {
    presets,
    activePresetId,
    presetsStatus,
    loadPresets,
    savePreset,
    applyPresetById,
    deletePreset,
    updatePreset,
  } = useToolsStore();
  const [presetName, setPresetName] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId),
    [presets, activePresetId]
  );

  useEffect(() => {
    if (presets.length === 0) {
      void loadPresets();
    }
  }, [loadPresets, presets.length]);

  useEffect(() => {
    if (activePreset) {
      setMakePublic(Boolean(activePreset.isPublic));
      setWorkspaceId(activePreset.workspaceId ?? null);
      setPresetName(activePreset.name ?? "");
    }
  }, [activePreset]);

  const handleSave = async () => {
    const nameToUse = presetName.trim() || "Untitled preset";
    const preset = await savePreset(nameToUse, {
      makePublic,
      workspaceId,
    });
    if (preset) {
      toast({ title: "Preset saved", description: `${nameToUse} is ready to use.` });
    } else {
      toast({ title: "Unable to save preset", description: "Please try again." });
    }
  };

  const handleApply = async (id: string) => {
    await applyPresetById(id);
    const selected = presets.find((preset) => preset.id === id);
    toast({
      title: selected?.name ?? "Preset loaded",
      description: "Tools updated without disrupting your chat thread.",
    });
  };

  const handleShareLink = async () => {
    if (!activePresetId) return;
    await updatePreset(activePresetId, { isPublic: true });
    try {
      const shareUrl = `${window.location.origin}/chat?presetId=${activePresetId}`;
      await navigator.clipboard.writeText(shareUrl);
      setMakePublic(true);
      toast({ title: "Share link copied", description: "Anyone with the link can load this preset." });
    } catch (error) {
      console.error(error);
      toast({ title: "Could not copy link", description: "Copy it manually from the address bar." });
    }
  };

  const handleWorkspaceChange = async (value: string) => {
    const nextWorkspace = value === "none" ? null : value;
    setWorkspaceId(nextWorkspace);
    if (activePresetId) {
      await updatePreset(activePresetId, { workspaceId: nextWorkspace });
    }
  };

  const handleDelete = async () => {
    if (!activePresetId) return;
    await deletePreset(activePresetId);
    toast({ title: "Preset removed", description: "It will no longer appear in your list." });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">Presets</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Save and reuse tool settings. Shared presets respect your workspace and link settings.
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Refresh presets"
          onClick={() => loadPresets()}
        >
          <RefreshCw
            size={16}
            className={presetsStatus === "loading" ? "animate-spin" : "text-gray-500"}
          />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Preset name"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSave} disabled={presetsStatus === "loading"} className="sm:w-auto">
            Save current preset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm text-gray-700 dark:text-gray-200">Saved presets</Label>
            <Select
              value={activePresetId ?? ""}
              onValueChange={handleApply}
              disabled={presets.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!activePresetId}
                onClick={handleShareLink}
              >
                <Link size={16} className="mr-2" /> Copy share link
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!activePresetId}
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Make preset public</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow teammates to load via link while keeping your preferences scoped to your user.
                </p>
              </div>
              <Switch
                checked={makePublic}
                onCheckedChange={async (checked) => {
                  setMakePublic(checked);
                  if (activePresetId) {
                    await updatePreset(activePresetId, { isPublic: checked });
                  }
                }}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="workspace" className="text-sm text-gray-700 dark:text-gray-200">
                Share to workspace
              </Label>
              <Select
                value={workspaceId ?? "none"}
                onValueChange={handleWorkspaceChange}
                disabled={!activePresetId}
              >
                <SelectTrigger id="workspace">
                  <SelectValue placeholder="Choose a workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {WORKSPACE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContextPanel() {
  const {
    fileSearchEnabled,
    setFileSearchEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
    functionsEnabled,
    setFunctionsEnabled,
  } = useToolsStore();
  
  return (
    <div className="h-full w-full bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex flex-col overflow-y-auto h-full p-4 space-y-4">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">AI Assistant Tools</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-6">Configure the capabilities of your assistant</p>
        </div>

        <div className="space-y-6">
          <PresetManager />

          <PanelConfig
            title="File Search"
            tooltip="Search through knowledge bases (vector stores)"
            enabled={fileSearchEnabled}
            setEnabled={setFileSearchEnabled}
            icon={<Database size={18} />}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
              <FileSearchSetup />
            </div>
          </PanelConfig>
          
          <PanelConfig
            title="Web Search"
            tooltip="Allow the assistant to search the web for up-to-date information"
            enabled={webSearchEnabled}
            setEnabled={setWebSearchEnabled}
            icon={<Globe size={18} />}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
              <WebSearchConfig />
            </div>
          </PanelConfig>
          
          <PanelConfig
            title="Functions"
            tooltip="Access specialized functions like weather data, jokes, and more"
            enabled={functionsEnabled}
            setEnabled={setFunctionsEnabled}
            icon={<Terminal size={18} />}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
              <FunctionsView />
            </div>
          </PanelConfig>
        </div>
      </div>
    </div>
  );
}
