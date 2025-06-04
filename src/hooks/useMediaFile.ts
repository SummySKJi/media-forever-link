
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
      if (!accessLink) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/functions/v1/get-media?id=${accessLink}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch file');
        }

        setFile(result.file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
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
