
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-6">
            Media2Link
          </h1>
          <p className="text-2xl text-slate-700 max-w-3xl mx-auto mb-8 font-medium">
            Professional file sharing with permanent cloud hosting
          </p>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Upload any media file and receive a secure, permanent link that works everywhere. 
            No registration required, enterprise-grade reliability.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {!uploadedFile ? (
            <div className="space-y-20">
              {/* Upload Zone */}
              <section aria-label="File upload area" className="mb-12">
                <FileUploadZone 
                  onFileSelect={handleFileUpload} 
                  isUploading={isUploading}
                />
              </section>
              
              {/* Features Grid */}
              <section aria-label="Key features" className="mt-20">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Enterprise-Grade File Sharing
                  </h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Built for professionals who need reliable, permanent file hosting
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-slate-900">Instant Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Drag & drop files up to 500MB. Support for all media formats including images, videos, audio, and documents.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Link2 className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-slate-900">Permanent Links</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Direct cloud URLs that never expire. Professional-grade hosting with 99.9% uptime guarantee.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-slate-900">Universal Access</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Preview files in any browser or download instantly. Compatible with all platforms and devices.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Additional Benefits */}
              <section aria-label="Additional benefits" className="mt-20">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-lg text-slate-900">Enterprise Security</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Bank-level encryption and secure cloud infrastructure. Your files are protected with industry-standard security.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-lg text-slate-900">Lightning Fast</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Global CDN ensures instant uploads and downloads worldwide. Optimized for speed and reliability.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-lg text-slate-900">Global Reach</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-center leading-relaxed">
                        Links work everywhere - social media, email, websites, and applications. No special software required.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Developer Section */}
              <DeveloperSection />
            </div>
          ) : (
            <div className="space-y-12">
              {/* File Preview */}
              <FilePreview file={uploadedFile} />
              
              {/* Shareable Link */}
              <ShareableLink url={shareableUrl} />
              
              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={resetUpload} 
                  variant="outline" 
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm border-slate-300 hover:bg-slate-50 text-slate-900"
                >
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-24">
        <div className="text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-8"></div>
          <p className="text-slate-500 text-sm">
            &copy; 2024 Media2Link. Professional file sharing service.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
