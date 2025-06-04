
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Link2, Eye } from 'lucide-react';
import FileUploadZone from '@/components/FileUploadZone';
import FilePreview from '@/components/FilePreview';
import ShareableLink from '@/components/ShareableLink';
import { useFileUpload } from '@/hooks/useFileUpload';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [shareableUrl, setShareableUrl] = useState('');
  const { uploadFile, isUploading } = useFileUpload();

  const handleFileUpload = async (file) => {
    console.log('File selected for upload:', file.name, file.size, file.type);
    
    const result = await uploadFile(file);
    
    if (result) {
      console.log('Upload result received:', result);
      
      // Transform the database file to match the expected format
      const transformedFile = {
        id: result.file.id,
        name: result.file.file_name,
        type: result.file.file_type,
        size: result.file.file_size,
        url: result.file.cloudinary_url,
        uploadedAt: new Date(result.file.uploaded_at)
      };
      
      console.log('Transformed file:', transformedFile);
      
      setUploadedFile(transformedFile);
      setShareableUrl(result.shareUrl);
    } else {
      console.log('Upload failed, no result returned');
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setShareableUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Share4Ever
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload any media file and get a permanent shareable link that works forever
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!uploadedFile ? (
            <div className="space-y-8">
              {/* Upload Zone */}
              <FileUploadZone 
                onFileSelect={handleFileUpload} 
                isUploading={isUploading}
              />
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Easy Upload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Drag & drop or click to upload images, videos, audio, and documents up to 500MB
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Link2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Permanent Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Get instant shareable links that work forever, no expiration or broken links
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Eye className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg">Preview & Download</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Recipients can preview media files directly in browser or download them
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* File Preview */}
              <FilePreview file={uploadedFile} />
              
              {/* Shareable Link */}
              <ShareableLink url={shareableUrl} />
              
              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button onClick={resetUpload} variant="outline" size="lg">
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
