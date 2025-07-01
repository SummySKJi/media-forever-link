
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
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return new Response(
        JSON.stringify({ error: 'File size exceeds 500MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Cloudinary credentials
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    console.log('Cloudinary credentials check:', { 
      cloudName: !!cloudName, 
      apiKey: !!apiKey, 
      apiSecret: !!apiSecret 
    })

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials')
      return new Response(
        JSON.stringify({ error: 'Cloudinary credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create signature for authenticated upload
    const timestamp = Math.round(Date.now() / 1000)
    const publicId = `media2link_${crypto.randomUUID()}`
    
    // Create signature string
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    
    // Create signature using Web Crypto API
    const encoder = new TextEncoder()
    const signData = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-1', signData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Upload to Cloudinary
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('public_id', publicId)
    uploadFormData.append('timestamp', timestamp.toString())
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('signature', signature)
    
    console.log('Uploading to Cloudinary...')
    
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    console.log('Cloudinary response status:', cloudinaryResponse.status)
    
    const responseText = await cloudinaryResponse.text()
    console.log('Cloudinary response:', responseText.substring(0, 200))

    let cloudinaryData
    try {
      cloudinaryData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Cloudinary response:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid response from Cloudinary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary upload failed:', cloudinaryData)
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Cloudinary', details: cloudinaryData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique access link
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    console.log('Generated access link:', accessLink)

    // Save to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return new Response(
        JSON.stringify({ error: 'Database configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Saving to Supabase database...')

    const { data: dbData, error } = await supabase
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
        JSON.stringify({ error: 'Failed to save file metadata', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('File uploaded successfully:', dbData.id)

    // Use Cloudinary URL as the shareable link
    const shareUrl = cloudinaryData.secure_url

    return new Response(
      JSON.stringify({
        success: true,
        file: dbData,
        shareUrl: shareUrl
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
