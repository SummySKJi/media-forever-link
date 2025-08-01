
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

    // No file size limit - proceed with upload

    // Get Cloudinary credentials
    const cloudinaryCloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const cloudinaryApiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const cloudinaryApiSecret = Deno.env.get('CLOUDINARY_API_SECRET')
    
    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      console.error('Missing Cloudinary credentials')
      return new Response(
        JSON.stringify({ error: 'Cloudinary configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique public ID
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().split('-')[0]
    const publicId = `media2link_${timestamp}_${randomId}`
    
    console.log('Uploading to Cloudinary:', publicId)
    
    // Use direct file upload to Cloudinary instead of base64 conversion
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`
    
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)  // Upload file directly without base64 conversion
    cloudinaryFormData.append('public_id', publicId)
    cloudinaryFormData.append('api_key', cloudinaryApiKey)
    
    // Generate signature for Cloudinary
    const timestamp_signature = Math.round(Date.now() / 1000)
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp_signature}${cloudinaryApiSecret}`
    const signature = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(stringToSign))
    const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    cloudinaryFormData.append('timestamp', timestamp_signature.toString())
    cloudinaryFormData.append('signature', signatureHex)

    console.log('Starting Cloudinary upload...')
    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    })

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('Cloudinary upload failed:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Cloudinary', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cloudinaryData = await cloudinaryResponse.json()
    console.log('Cloudinary upload successful:', cloudinaryData.public_id)

    const publicUrl = cloudinaryData.secure_url

    // Generate unique access link
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    console.log('Generated access link:', accessLink)

    console.log('Saving to Supabase database...')

    // Get Supabase credentials for database operations
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

    const { data: dbData, error } = await supabase
      .from('media_files')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        cloudinary_public_id: publicId,
        cloudinary_url: publicUrl,
        access_link: accessLink,
      })
      .select()
      .maybeSingle()

    if (error || !dbData) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: error?.message || 'No data returned' }),
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
