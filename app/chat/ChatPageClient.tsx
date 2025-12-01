'use client';

import { SparklesIcon, Menu, X, ListTodo, PanelLeft } from 'lucide-react';
import ContextPanel from '@/components/tools-panel';
import { useState, useEffect, useMemo } from 'react';
import Assistant from '@/components/assistant';
import ChatPromptSelector from '@/components/chat-prompt-selector';
import PromptPicker from '@/components/prompt-picker';
import { useSearchParams } from 'next/navigation';
import useToolsStore from '@/stores/useToolsStore';

interface ConfigPanelHeaderProps {
  onCollapse: () => void;
}
const ConfigPanelHeader = ({ onCollapse }: ConfigPanelHeaderProps) => (
  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
    <h2
      id="config-panel-title"
      className="text-lg font-medium text-foreground flex items-center"
    >
      <SparklesIcon
        size={16}
        className="text-indigo-600 dark:text-indigo-400 mr-2"
      />
      Configuration
    </h2>
    <button
      className="hidden md:block p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={onCollapse}
      aria-label="Collapse settings"
      aria-expanded="true"
      aria-controls="desktop-config-panel"
    >
      <X size={20} className="text-foreground" />
    </button>
  </div>
);

interface MobileToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileToolsPanel = ({ isOpen, onClose }: MobileToolsPanelProps) =>
  isOpen ? (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30 backdrop-blur-sm md:hidden">
      <div className="w-11/12 max-w-sm bg-white dark:bg-gray-900 h-full shadow-lg animate-slide-in-from-right">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2
            id="mobile-config-title"
            className="text-lg font-medium text-foreground flex items-center"
          >
            <SparklesIcon
              size={16}
              className="text-indigo-600 dark:text-indigo-400 mr-2"
            />
            Configuration
          </h2>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>
        <ContextPanel />
      </div>
    </div>
  ) : null;

interface ChatPageClientProps {
  initialPrompt?: string;
}

export default function ChatPageClient({ initialPrompt }: ChatPageClientProps) {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(true);
  const searchParams = useSearchParams();
  const loadPresets = useToolsStore((state) => state.loadPresets);
  const applyPresetById = useToolsStore((state) => state.applyPresetById);
  const sharedPresetId = useMemo(() => searchParams.get('presetId'), [searchParams]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPickerOpen(true);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  useEffect(() => {
    const initializePresets = async () => {
      await loadPresets(false);
      const { presets, lastUsedPresetId } = useToolsStore.getState();
      const fallbackPreset =
        sharedPresetId ?? lastUsedPresetId ?? presets.find((preset) => preset.lastUsedAt)?.id;
      if (fallbackPreset) {
        await applyPresetById(fallbackPreset);
      }
    };

    void initializePresets();
  }, [applyPresetById, loadPresets, sharedPresetId]);

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <div className="relative flex flex-1 w-full max-w-7xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg my-4 overflow-hidden">
        <div
          className={`w-full ${
            isConfigPanelOpen ? 'md:w-2/3 lg:w-3/4' : 'md:w-full'
          } border-r border-gray-100 dark:border-gray-800 flex flex-col px-4 md:px-6`}
        >
          <ChatPromptSelector />
          <Assistant initialInputMessage={initialPrompt} />
          <PromptPicker open={pickerOpen} onOpenChange={setPickerOpen} />
        </div>
        <div
          id="desktop-config-panel"
          className={`hidden md:block overflow-hidden bg-white dark:bg-gray-900 transition-[width] duration-300 ${
            isConfigPanelOpen
              ? 'w-full md:w-1/3 lg:w-1/4 border-l border-gray-100 dark:border-gray-800 px-4 md:px-6'
              : 'w-0 border-0 px-0'
          }`}
          aria-hidden={!isConfigPanelOpen}
        >
          {isConfigPanelOpen && (
            <>
              <ConfigPanelHeader
                onCollapse={() => setIsConfigPanelOpen(false)}
              />
              <ContextPanel />
            </>
          )}
        </div>
        {!isConfigPanelOpen && (
          <button
            onClick={() => setIsConfigPanelOpen(true)}
            className="hidden md:flex fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-white dark:bg-gray-900 p-2 rounded-l-full shadow"
            aria-label="Open settings"
            aria-expanded="false"
            aria-controls="desktop-config-panel"
          >
            <PanelLeft size={20} />
          </button>
        )}
        {/* Mobile actions */}
        <div className="fixed bottom-4 right-4 md:hidden z-40 flex gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            aria-label="Open prompts"
          >
            <ListTodo size={20} />
          </button>
          <button
            onClick={() => setIsToolsPanelOpen(true)}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            aria-label="Open settings"
            aria-expanded={isToolsPanelOpen}
            aria-controls="mobile-config-panel"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile tools panel */}
        <MobileToolsPanel
          isOpen={isToolsPanelOpen}
          onClose={() => setIsToolsPanelOpen(false)}
        />
      </div>
    </div>
  );
}
