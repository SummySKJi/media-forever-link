
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Starting file upload:', file.name, file.size, file.type);
      
      // Validate file size on frontend too
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 500MB limit');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('Calling Supabase edge function...');
      
      // Use Supabase function invocation instead of direct fetch
      const { data, error } = await supabase.functions.invoke('upload-media', {
        body: formData,
      });

      console.log('Upload response:', { data, error });
      
      if (error) {
        console.error('Upload failed:', error);
        throw new Error(error.message || 'Upload failed');
      }

      if (!data || !data.success || !data.file) {
        throw new Error('Invalid response from server');
      }

      toast({
        title: "Upload Successful!",
        description: "Your file has been uploaded and is ready to share.",
      });

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = "There was an error uploading your file. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
