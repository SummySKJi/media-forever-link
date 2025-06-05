
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        console.log('Fetching file with access link:', accessLink);
        
        const { data, error } = await supabase.functions.invoke('get-media', {
          body: { id: accessLink }
        });

        console.log('Get media response:', { data, error });

        if (error) {
          throw new Error(error.message || 'Failed to fetch file');
        }

        if (!data || !data.file) {
          throw new Error('File not found');
        }

        setFile(data.file);
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
