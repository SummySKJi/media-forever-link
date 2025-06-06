
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  cloudinary_url: string;
  access_link: string;
  uploaded_at: string;
}

interface UseMediaFileReturn {
  file: MediaFile | null;
  loading: boolean;
  error: string | null;
}

export const useMediaFile = (accessLink: string): UseMediaFileReturn => {
  const [file, setFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFile = async () => {
      if (!accessLink) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching file with access link:', accessLink);
        
        // Use the correct Supabase Edge Function URL
        const functionUrl = `https://nwepfribozwhpzwlpiuq.supabase.co/functions/v1/get-media`;
        
        const response = await fetch(`${functionUrl}?id=${encodeURIComponent(accessLink)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Function call failed:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Get media response:', data);

        if (!data || !data.file) {
          console.error('No file data in response:', data);
          throw new Error('File not found in response');
        }

        console.log('File retrieved successfully:', data.file);
        setFile(data.file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
        console.error('useMediaFile error:', err);
        setError(errorMessage);
        
        toast({
          title: "File Not Found",
          description: "The requested file could not be found or loaded.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [accessLink, toast]);

  return { file, loading, error };
};
