
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Video, Music, Download, Calendar, HardDrive } from 'lucide-react';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: Date;
  };
}

const FilePreview = ({ file }: FilePreviewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-orange-500" />;
  };

  const getFileTypeLabel = () => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    return 'Document';
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video 
            src={file.url} 
            controls
            className="w-full h-full"
          />
        </div>
      );
    }

    if (file.type.startsWith('audio/')) {
      return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center mb-4">
            <Music className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700">Audio File</h4>
          </div>
          <audio 
            src={file.url} 
            controls
            className="w-full"
          />
        </div>
      );
    }

    return (
      <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg text-center">
        <FileText className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Document File</h4>
        <p className="text-gray-500">Preview not available. Recipients can download the file.</p>
      </div>
    );
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <CardTitle className="text-xl">{file.name}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{getFileTypeLabel()}</span>
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{file.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderPreview()}
      </CardContent>
    </Card>
  );
};

export default FilePreview;
