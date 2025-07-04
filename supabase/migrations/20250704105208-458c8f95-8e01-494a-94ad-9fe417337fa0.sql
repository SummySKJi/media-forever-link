-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Create storage policies for media files
CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');

CREATE POLICY "Anyone can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files');

CREATE POLICY "Anyone can update media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media-files');

CREATE POLICY "Anyone can delete media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media-files');