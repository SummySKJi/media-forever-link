
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
        
        // Use direct fetch to the Edge Function with proper URL construction
        const response = await fetch(`https://nwepfribozwhpzwlpiuq.supabase.co/functions/v1/get-media?id=${accessLink}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Function call failed:', errorData);
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('Get media response:', data);

        if (!data || !data.file) {
          console.error('No file data in response:', data);
          throw new Error('File not found');
        }

        console.log('File retrieved successfully:', data.file);
        setFile(data.file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
        console.error('useMediaFile error:', err);
        setError(errorMessage);
        toast({
          title: "File Not Found",
          description: errorMessage,
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
