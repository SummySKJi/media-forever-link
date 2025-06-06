
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, Video, Music, ArrowLeft, Calendar, HardDrive } from 'lucide-react';
import { useMediaFile } from '@/hooks/useMediaFile';

const MediaPreview = () => {
  const { id } = useParams();
  const { file: fileData, loading, error } = useMediaFile(id || '');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (!fileData) return <FileText className="w-8 h-8 text-gray-500" />;
    if (fileData.file_type.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />;
    if (fileData.file_type.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
    if (fileData.file_type.startsWith('audio/')) return <Music className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-orange-500" />;
  };

  const getFileTypeLabel = () => {
    if (!fileData) return 'File';
    if (fileData.file_type.startsWith('image/')) return 'Image';
    if (fileData.file_type.startsWith('video/')) return 'Video';
    if (fileData.file_type.startsWith('audio/')) return 'Audio';
    return 'Document';
  };

  const handleDownload = () => {
    if (fileData && fileData.cloudinary_url) {
      const link = document.createElement('a');
      link.href = fileData.cloudinary_url;
      link.download = fileData.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFilePreview = () => {
    if (!fileData) return null;

    if (fileData.file_type.startsWith('image/')) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={fileData.cloudinary_url} 
            alt={fileData.file_name}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (fileData.file_type.startsWith('video/')) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video 
            src={fileData.cloudinary_url} 
            controls
            className="w-full h-full"
          />
        </div>
      );
    }

    if (fileData.file_type.startsWith('audio/')) {
      return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center mb-4">
            <Music className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700">Audio File</h4>
          </div>
          <audio 
            src={fileData.cloudinary_url} 
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
        <p className="text-gray-500 mb-4">Preview not available for this file type.</p>
        <Button onClick={handleDownload} className="flex items-center space-x-2 mx-auto">
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">File Not Found</h1>
          <p className="text-gray-600 mb-4">
            The requested file could not be found. The link may be invalid or the file may have been removed.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Error: {error}</p>
            <p className="text-sm text-gray-500">Access ID: {id}</p>
          </div>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Share4Ever
          </h1>
          <p className="text-gray-600">Shared file preview</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon()}
                  <div>
                    <CardTitle className="text-xl">{fileData.file_name}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">
                        {getFileTypeLabel()}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <HardDrive className="w-4 h-4" />
                        <span>{formatFileSize(fileData.file_size)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(fileData.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleDownload} className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderFilePreview()}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Upload Your Own File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
