
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  cloudinary_url: string;
  access_link: string;
  uploaded_at: string;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<{ file: UploadedFile; shareUrl: string } | null>;
  isUploading: boolean;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<{ file: UploadedFile; shareUrl: string } | null> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/functions/v1/upload-media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "Upload Successful!",
        description: "Your file has been uploaded and is ready to share.",
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
