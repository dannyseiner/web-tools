"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  File,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
  preview?: string;
}

export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  label?: string;
  showSize?: boolean;
  error?: string;
  disabled?: boolean;

  showPreview?: boolean;
}

export function FileUpload({
  accept = "*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  multiple = false,
  files = [],
  onFilesChange,
  label,
  showSize = true,
  error,
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.startsWith("video/")) return FileVideo;
    if (type.startsWith("audio/")) return FileAudio;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`;
    }

    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return file.type.startsWith(category + "/");
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File "${file.name}" is not an accepted file type. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
      const filesToProcess = Array.from(fileList);

      // Check max files limit
      if (files.length + filesToProcess.length > maxFiles) {
        setUploadError(
          `You can only upload up to ${maxFiles} file${maxFiles > 1 ? "s" : ""}`,
        );
        setIsProcessing(false);
        return;
      }

      // Validate all files first
      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          setIsProcessing(false);
          return;
        }
      }

      // Process files
      const newFiles: UploadedFile[] = await Promise.all(
        filesToProcess.map(async (file) => {
          const base64 = await fileToBase64(file);
          const uploadedFile: UploadedFile = {
            id: Math.random().toString(36).substring(7) + Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            base64,
          };

          // Generate preview for images
          if (file.type.startsWith("image/") && showPreview) {
            uploadedFile.preview = base64;
          }

          return uploadedFile;
        }),
      );

      onFilesChange([...files, ...newFiles]);
    } catch (err) {
      setUploadError("Failed to process files. Please try again.");
      console.error("File processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      processFiles(droppedFiles);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, files, maxFiles],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input value so the same file can be selected again
    e.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(files.filter((f) => f.id !== fileId));
    setUploadError(null);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : displayError
                ? "border-destructive bg-destructive/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center gap-3">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <div
              className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all
              ${isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"}
            `}
            >
              <Upload
                className={`h-8 w-8 transition-all ${
                  isDragging ? "text-primary scale-110" : "text-primary"
                }`}
              />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {label ||
                (isDragging
                  ? "Drop files here"
                  : isProcessing
                    ? "Processing files..."
                    : "Drag & drop files here, or click to browse")}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept !== "*" && `Accepted: ${accept} • `}
              Max size: {formatFileSize(maxSize)}
              {maxFiles > 1 && ` • Up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-3"
          >
            <p className="text-sm text-destructive">{displayError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-foreground">
              Uploaded Files ({files.length}/{maxFiles})
            </p>
            <div className="space-y-2">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 group hover:shadow-md transition-all"
                  >
                    {/* File Preview or Icon */}
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      {showSize && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
