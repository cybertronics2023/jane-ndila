-- Enable Row Level Security (RLS) is enabled by default on new tables usually, but good to be explicit
-- Create the table for storing site content
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY DEFAULT 'main',
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policy to allow purely public read access (for the website)
CREATE POLICY "Enable read access for all users" ON public.site_content
    FOR SELECT
    USING (true);

-- Policy to allow public modifications (for the admin app using anon key)
-- WARNING: This allows anyone with your anon key (which is public on your site) to edit your content.
-- This is acceptable for this specific "static site" use case where you want a simple setup, 
-- but normally you would restrict this to authenticated users.
CREATE POLICY "Enable insert for all users" ON public.site_content
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.site_content
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Storage Setup
-- Attempt to create the 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of images
CREATE POLICY "Give public access to images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');

-- Policy to allow public uploading of images (for Admin App)
CREATE POLICY "Give public upload access to images" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'images');

-- Policy to allow public updating/deleting of images (optional, for replacing images)
CREATE POLICY "Give public update access to images" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'images');
    
CREATE POLICY "Give public delete access to images" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'images');
