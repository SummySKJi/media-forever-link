
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

      console.log('Calling upload-media function...');
      
      // Call the edge function using Supabase functions invoke
      const { data, error: functionError } = await supabase.functions.invoke('upload-media', {
        body: formData,
      });

      console.log('Upload response:', { data, error: functionError });
      
      if (functionError) {
        console.error('Upload failed:', functionError);
        throw new Error(`Upload failed: ${functionError.message}`);
      }
      console.log('Upload response data:', data);
      
      if (!data || !data.success || !data.file) {
        console.error('Invalid response from server:', data);
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
