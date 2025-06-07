import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Link2, Eye, Shield, Zap, Globe } from 'lucide-react';
import FileUploadZone from '@/components/FileUploadZone';
import FilePreview from '@/components/FilePreview';
import ShareableLink from '@/components/ShareableLink';
import DeveloperSection from '@/components/DeveloperSection';
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
      <header className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Share4Ever
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Upload any media file and get a permanent shareable link that works forever
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Free file sharing service with direct cloud hosting. No registration required, no expiration dates, unlimited sharing.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {!uploadedFile ? (
            <div className="space-y-8">
              {/* Upload Zone */}
              <section aria-label="File upload area">
                <FileUploadZone 
                  onFileSelect={handleFileUpload} 
                  isUploading={isUploading}
                />
              </section>
              
              {/* Features */}
              <section aria-label="Key features" className="mt-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                  Why Choose Share4Ever?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">Easy Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">
                        Drag & drop or click to upload images, videos, audio, and documents up to 500MB. No registration required.
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
                        Get instant direct cloud links that work forever. No expiration dates, no broken links, guaranteed availability.
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
                        Recipients can preview media files directly in browser or download them instantly. Works on all devices.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Additional Benefits */}
              <section aria-label="Additional benefits" className="mt-16">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Secure & Reliable</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">
                        Your files are hosted on secure cloud infrastructure with 99.9% uptime guarantee and enterprise-grade security.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-yellow-600" />
                      </div>
                      <CardTitle className="text-lg">Lightning Fast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">
                        Powered by global CDN for instant uploads and downloads. Optimized delivery worldwide with minimal latency.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-red-600" />
                      </div>
                      <CardTitle className="text-lg">Universal Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">
                        Direct links work everywhere - social media, email, websites, apps. No special viewers or accounts needed.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Developer Section */}
              <DeveloperSection />
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
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center text-gray-500">
          <p>&copy; 2024 Share4Ever. Free permanent file sharing service.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
