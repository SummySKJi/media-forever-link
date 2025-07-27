
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Image, Video, Music, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgress {
  step: string;
  progress: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  fileSize: number;
  fileName: string;
}

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: UploadProgress | null;
}

const FileUploadZone = ({ onFileSelect, isUploading, uploadProgress }: FileUploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent any default form submission
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files[0]);
      // Clear the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Card className={cn(
      "bg-white/70 backdrop-blur-sm border-2 border-dashed transition-all duration-300 hover:shadow-xl",
      isDragOver ? "border-blue-500 bg-blue-50/70" : "border-gray-300",
      isUploading && "pointer-events-none opacity-50"
    )}>
      <CardContent className="p-12">
        <div
          className="text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading && uploadProgress ? (
            <div className="space-y-6">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-700">{uploadProgress.step}</h3>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{uploadProgress.progress}%</span>
                    <span>{formatFileSize(uploadProgress.fileSize)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* File Info */}
                <div className="text-center space-y-2">
                  <p className="text-gray-600 font-medium">{uploadProgress.fileName}</p>
                  <div className="flex justify-center gap-6 text-sm text-gray-500">
                    <span>Elapsed: {formatTime(uploadProgress.timeElapsed)}</span>
                    {uploadProgress.progress < 100 && uploadProgress.estimatedTimeRemaining > 0 && (
                      <span>Remaining: {formatTime(uploadProgress.estimatedTimeRemaining)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
              <h3 className="text-2xl font-semibold text-gray-700">Uploading your file...</h3>
              <p className="text-gray-500">Please wait while we process your upload</p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                Drop your file here or click to browse
              </h3>
              <p className="text-gray-500 mb-6">
                Support for images, videos, audio, and documents - no size limit
              </p>
              
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose File
              </label>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 rounded-lg">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Images</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 rounded-lg">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">Videos</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 rounded-lg">
                  <Music className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Audio</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">Documents</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;
