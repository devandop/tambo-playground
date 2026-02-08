"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { Upload, X, FileSpreadsheet, AlertCircle } from "lucide-react";

interface CSVData {
  headers: string[];
  rows: any[];
  fileName: string;
}

interface CSVUploadProps {
  onDataParsed: (data: CSVData) => void;
  onClear?: () => void;
}

export function CSVUpload({ onDataParsed, onClear }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(
    (file: File) => {
      setError(null);
      setIsProcessing(true);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsProcessing(false);

          if (results.errors.length > 0) {
            setError(`Parsing error: ${results.errors[0].message}`);
            return;
          }

          if (results.data.length === 0) {
            setError("CSV file is empty");
            return;
          }

          const headers = results.meta.fields || [];
          const rows = results.data;

          setUploadedFile(file.name);
          onDataParsed({
            headers,
            rows,
            fileName: file.name,
          });
        },
        error: (error) => {
          setIsProcessing(false);
          setError(`Failed to parse CSV: ${error.message}`);
        },
      });
    },
    [onDataParsed]
  );

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB");
      return;
    }

    parseCSV(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClear = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear?.();
  };

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }
            ${isProcessing ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              isDragging ? "text-blue-500" : "text-gray-400"
            }`}
          />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isProcessing ? "Processing..." : "Upload CSV File"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: 10MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile}
                </p>
                <p className="text-xs text-gray-500">CSV file uploaded</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
