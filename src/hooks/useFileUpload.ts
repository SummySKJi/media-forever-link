
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

interface UploadProgress {
  step: string;
  progress: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  fileSize: number;
  fileName: string;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<{ file: UploadedFile; shareUrl: string } | null>;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const updateProgress = (step: string, progress: number, startTime: number, file: File) => {
    const timeElapsed = Date.now() - startTime;
    const estimatedTotal = timeElapsed / (progress / 100);
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - timeElapsed);
    
    setUploadProgress({
      step,
      progress,
      timeElapsed,
      estimatedTimeRemaining,
      fileSize: file.size,
      fileName: file.name
    });
  };

  const uploadFile = async (file: File): Promise<{ file: UploadedFile; shareUrl: string } | null> => {
    setIsUploading(true);
    const startTime = Date.now();
    
    try {
      console.log('Starting file upload:', file.name, file.size, file.type);
      
      // Step 1: Preparing upload
      updateProgress('Preparing file upload...', 10, startTime, file);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual feedback
      
      // No file size limit
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('Calling upload-media function...');
      
      // Step 2: Uploading to cloud
      updateProgress('Uploading to cloud storage...', 25, startTime, file);
      
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

      // Step 3: Processing upload
      updateProgress('Processing upload...', 70, startTime, file);

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      // Step 4: Finalizing
      updateProgress('Finalizing upload...', 90, startTime, file);

      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (!data || !data.success || !data.file) {
        console.error('Invalid response from server:', data);
        throw new Error('Invalid response from server');
      }

      // Step 5: Complete
      updateProgress('Upload complete!', 100, startTime, file);

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
      setUploadProgress(null);
    }
  };

  return { uploadFile, isUploading, uploadProgress };
};
