
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
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Cloudinary credentials from secrets
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Cloudinary credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upload to Cloudinary
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', 'ml_default') // Using unsigned preset
    
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    const cloudinaryData = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary upload failed:', cloudinaryData)
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Cloudinary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique access link
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    // Save metadata to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('media_files')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        cloudinary_public_id: cloudinaryData.public_id,
        cloudinary_url: cloudinaryData.secure_url,
        access_link: accessLink,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        file: data,
        shareUrl: `${req.headers.get('origin')}/media/${accessLink}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
