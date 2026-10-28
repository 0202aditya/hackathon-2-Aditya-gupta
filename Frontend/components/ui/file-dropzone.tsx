"use client";

import * as React from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { Button } from "./button";

interface FileDropzoneProps {
  onFileSelect: (file: { name: string; size: string; rawFile?: File }) => void;
  selectedFile: { name: string; size: string } | null;
  onRemoveFile: () => void;
  error?: string;
}

export function FileDropzone({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  error,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      onFileSelect({ name: file.name, size: `${sizeMb} MB`, rawFile: file });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      onFileSelect({ name: file.name, size: `${sizeMb} MB`, rawFile: file });
    }
  };

  if (selectedFile) {
    return (
      <div className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-[rgba(134,168,255,0.12)] border border-[rgba(134,168,255,0.25)] flex items-center justify-center text-[var(--primary)] shrink-0">
            <FileText className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-sans font-bold text-[var(--foreground)] truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[var(--muted)] font-mono">
              {selectedFile.size} &bull; Ready for analysis
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemoveFile}
          className="min-h-11 gap-1.5 text-xs text-[var(--risk-high)] hover:bg-[rgba(255,122,122,0.12)] shrink-0"
        >
          <X className="w-4 h-4" />
          <span>Remove</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer interactive-transition flex flex-col items-center justify-center ${
        isDragging
          ? "border-[var(--primary)] bg-[rgba(134,168,255,0.06)]"
          : error
          ? "border-[var(--risk-high)] bg-[rgba(255,122,122,0.04)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-raised)]/40 hover:bg-[var(--surface-raised)]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="w-14 h-14 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--primary)]">
        <UploadCloud className="w-7 h-7" strokeWidth={1.75} />
      </div>

      <p className="text-base font-sans font-bold text-[var(--foreground)] mb-1">
        Drop a PDF or Word file here, or choose a file
      </p>

      <p className="text-sm text-[var(--muted)]">
        Up to 10 MB
      </p>

      {error && (
        <p className="text-sm font-sans text-[var(--risk-high)] font-bold mt-3">
          {error}
        </p>
      )}
    </div>
  );
}

