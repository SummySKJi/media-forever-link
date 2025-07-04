
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Upload function started')
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('File received:', file.name, file.size, file.type)

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return new Response(
        JSON.stringify({ error: 'File size exceeds 500MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().split('-')[0]
    const fileName = `media2link_${timestamp}_${randomId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    console.log('Uploading to Supabase Storage:', fileName)
    
    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return new Response(
        JSON.stringify({ error: 'Supabase configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer()
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Supabase Storage', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Supabase upload successful:', uploadData.path)

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from('media-files')
      .getPublicUrl(fileName)
    
    const publicUrl = urlData.publicUrl

    // Generate unique access link
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    console.log('Generated access link:', accessLink)

    console.log('Saving to Supabase database...')

    const { data: dbData, error } = await supabase
      .from('media_files')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        cloudinary_public_id: fileName,
        cloudinary_url: publicUrl,
        access_link: accessLink,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('File uploaded successfully:', dbData.id)

    return new Response(
      JSON.stringify({
        success: true,
        file: dbData,
        shareUrl: publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
