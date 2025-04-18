/* stylelint-disable no-inline-styles */
"use client"
import React, { useCallback, useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  FilePlus2,
  Plus,
  Trash2,
  CircleX,
  FileText,
  FileCode,
  FileJson,
  File as FileIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useDropzone } from "react-dropzone"
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface FileUploadProps {
  vectorStoreId?: string;
  vectorStoreName?: string;
  onAddStore: (id: string) => void;
  onUnlinkStore: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <FileIcon className="text-red-500" size={24} />;
    case 'json':
      return <FileJson className="text-yellow-500" size={24} />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'cs':
    case 'go':
    case 'rb':
    case 'php':
      return <FileCode className="text-blue-500" size={24} />;
    case 'md':
    case 'txt':
    case 'doc':
    case 'docx':
      return <FileText className="text-gray-500" size={24} />;
    default:
      return <FileText className="text-gray-400" size={24} />;
  }
};

export default function FileUpload({
  vectorStoreId,
  onAddStore,
  onUnlinkStore,
}: FileUploadProps) {
  const [file, setFile] = useState(null as File | null);
  const [newStoreName, setNewStoreName] = useState("Default store");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(false);

  const acceptedFileTypes = {
    "text/x-c": [".c"],
    "text/x-c++": [".cpp"],
    "text/x-csharp": [".cs"],
    "text/css": [".css"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/x-golang": [".go"],
    "text/html": [".html"],
    "text/x-java": [".java"],
    "text/javascript": [".js"],
    "application/json": [".json"],
    "text/markdown": [".md"],
    "application/pdf": [".pdf"],
    "text/x-php": [".php"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      [".pptx"],
    "text/x-python": [".py"],
    "text/x-script.python": [".py"],
    "text/x-ruby": [".rb"],
    "application/x-sh": [".sh"],
    "text/x-tex": [".tex"],
    "application/typescript": [".ts"],
    "text/plain": [".txt"],
  };

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!dialogOpen) {
      setTimeout(() => {
        setError(null);
        setSuccess(false);
        setUploadProgress(0);
      }, 300);
    }
  }, [dialogOpen]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptedFileTypes,
    maxSize: 10485760, // 10MB
    onDropRejected: (fileRejections: any[]) => {
      console.error("Rejected files:", fileRejections)
    },
  })

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Simulated progress for better UX
  useEffect(() => {
    let interval: number;
    
    if (uploading && uploadProgress < 90) {
      interval = window.setInterval(() => {
        setUploadProgress((prev: number) => {
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 90);
        });
      }, 400);
    }
    
    return () => {
      window.clearInterval(interval);
    };
  }, [uploading, uploadProgress]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Content = arrayBufferToBase64(arrayBuffer);
      const fileObject = {
        name: file.name,
        content: base64Content,
      };

      // 1. Upload file
      const uploadResponse = await fetch("/api/vector_stores/upload_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileObject,
        }),
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Error uploading file: ${uploadResponse.statusText}`);
      }
      
      const uploadData = await uploadResponse.json();
      const fileId = uploadData.id;
      if (!fileId) {
        throw new Error("Error getting file ID");
      }
      
      setUploadProgress(60);
      let finalVectorStoreId = vectorStoreId;

      // 2. If no vector store is linked, create one
      if (!vectorStoreId || vectorStoreId === "") {
        const createResponse = await fetch("/api/vector_stores/create_store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeName: newStoreName,
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error(`Error creating vector store: ${createResponse.statusText}`);
        }
        
        const createData = await createResponse.json();
        finalVectorStoreId = createData.id;
      }

      if (!finalVectorStoreId) {
        throw new Error("Error getting vector store ID");
      }

      setUploadProgress(80);
      
      // 3. Add file to vector store
      const addFileResponse = await fetch("/api/vector_stores/add_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          vectorStoreId: finalVectorStoreId,
        }),
      });
      
      if (!addFileResponse.ok) {
        throw new Error(`Error adding file to vector store: ${addFileResponse.statusText}`);
      }
      
      onAddStore(finalVectorStoreId);
      
      setUploadProgress(100);
      setSuccess(true);
      
      // Close dialog after success
      setTimeout(() => {
        setFile(null);
        setDialogOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error during file upload process:", error);
      setUploadProgress(0);
      setError(error instanceof Error ? error.message : "There was an error processing your file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center py-2 px-4 gap-2 font-medium text-sm cursor-pointer hover:opacity-90 transition-all shadow-sm">
          <Plus size={16} />
          Upload File
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Add files to your vector store</DialogTitle>
          </DialogHeader>
          
          <div className="my-6">
            {!vectorStoreId || vectorStoreId === "" ? (
              <div className="flex flex-col md:flex-row md:items-start gap-4 text-sm">
                <label className="font-medium md:w-1/3" htmlFor="storeName">
                  New vector store name
                  <div className="text-xs text-gray-400 mt-1">
                    A new store will be created when you upload a file.
                  </div>
                </label>
                <Input
                  id="storeName"
                  type="text"
                  value={newStoreName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStoreName(e.target.value)}
                  className="flex-1 border-gray-200 rounded p-2 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-sm font-medium w-24 text-gray-700 dark:text-gray-300">
                      Vector store
                    </div>
                    <div className="text-gray-500 text-xs font-mono flex-1 text-ellipsis truncate">
                      {vectorStoreId}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleX
                            onClick={() => onUnlinkStore()}
                            size={16}
                            className="cursor-pointer text-gray-400 hover:text-gray-700 transition-all"
                            aria-label="Unlink vector store"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unlink vector store</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">File uploaded successfully!</span>
            </div>
          )}
          
          {/* Upload area */}
          <div className="mb-6">
            {file ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.name)}
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatBytes(file.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    disabled={uploading}
                    aria-label="Remove selected file"
                  >
                    <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                {uploading && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      {/* stylelint-disable-next-line no-inline-styles */}
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-xs text-gray-500 flex justify-between">
                      <span>Uploading...</span>
                      <span>{uploadProgress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-[180px] cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : isDragReject
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-3 rounded-full mb-3 ${
                      isDragActive
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : isDragReject
                        ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    <FilePlus2 size={24} />
                  </div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {isDragActive
                      ? 'Drop the file here'
                      : isDragReject
                      ? 'File type not accepted'
                      : 'Drag & drop or click to browse'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports code files, documents, and PDFs up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={uploading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || !file || success}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Uploading...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Uploaded
                </span>
              ) : (
                "Upload File"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
