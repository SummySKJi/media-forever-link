
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

    // Get Firebase credentials
    const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY')
    const firebaseStorageBucket = Deno.env.get('FIREBASE_STORAGE_BUCKET')
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID')

    console.log('Firebase credentials check:', { 
      apiKey: !!firebaseApiKey, 
      bucket: !!firebaseStorageBucket,
      projectId: !!firebaseProjectId
    })

    if (!firebaseApiKey || !firebaseStorageBucket || !firebaseProjectId) {
      console.error('Missing Firebase credentials')
      return new Response(
        JSON.stringify({ error: 'Firebase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer()
    const fileBytes = new Uint8Array(fileBuffer)
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().split('-')[0]
    const fileName = `media2link_${timestamp}_${randomId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    console.log('Uploading to Firebase Storage:', fileName)
    
    // First, get an auth token for Firebase
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInAnonymously?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnSecureToken: true
      })
    })

    if (!authResponse.ok) {
      console.error('Firebase auth failed:', authResponse.status)
      const authError = await authResponse.text()
      console.error('Auth error details:', authError)
      return new Response(
        JSON.stringify({ error: 'Firebase authentication failed', details: authError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authData = await authResponse.json()
    const idToken = authData.idToken

    // Upload to Firebase Storage using REST API
    const firebaseUploadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseStorageBucket}/o?uploadType=media&name=${encodeURIComponent(fileName)}`
    
    const firebaseResponse = await fetch(firebaseUploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'Authorization': `Bearer ${idToken}`,
      },
      body: fileBytes,
    })

    console.log('Firebase response status:', firebaseResponse.status)
    
    if (!firebaseResponse.ok) {
      const errorText = await firebaseResponse.text()
      console.error('Firebase upload failed:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Firebase', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const firebaseData = await firebaseResponse.json()
    console.log('Firebase upload successful:', firebaseData.name)

    // Generate download URL
    const firebaseDownloadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseStorageBucket}/o/${encodeURIComponent(fileName)}?alt=media`

    // Generate unique access link
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    console.log('Generated access link:', accessLink)

    // Save to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
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
        cloudinary_public_id: firebaseData.name || fileName,
        cloudinary_url: firebaseDownloadUrl,
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
        shareUrl: firebaseDownloadUrl
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
