
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
      
      // Get auth token for the request
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call the edge function directly with fetch for FormData support
      const response = await fetch(`https://nwepfribozwhpzwlpiuq.supabase.co/functions/v1/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZXBmcmlib3p3aHB6d2xwaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAxMDIsImV4cCI6MjA2NDYxNjEwMn0.GG24EBS27xXPY9iva1_P7CNrOL_1lhsUmtign5IWwTA'}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
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
        if (error.message.includes('Supabase Storage')) {
          errorMessage = "Storage upload failed. Please try again.";
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
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
