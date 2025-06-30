
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'

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

    // Initialize Firebase
    const firebaseConfig = {
      apiKey: Deno.env.get('FIREBASE_API_KEY'),
      authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN'),
      projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
      storageBucket: Deno.env.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: Deno.env.get('FIREBASE_APP_ID')
    }

    console.log('Firebase config check:', {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId
    })

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('Missing Firebase configuration')
      return new Response(
        JSON.stringify({ error: 'Firebase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)
    const db = getFirestore(app)

    // Get Cloudinary credentials from secrets
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
    const publicId = `share4ever_${crypto.randomUUID()}`
    
    // Create signature string
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    
    // Create signature using Web Crypto API
    const encoder = new TextEncoder()
    const signData = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-1', signData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Upload to Cloudinary with authentication
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('public_id', publicId)
    uploadFormData.append('timestamp', timestamp.toString())
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('signature', signature)
    
    console.log('Uploading to Cloudinary with signature...')
    
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    console.log('Cloudinary response status:', cloudinaryResponse.status)
    
    const responseText = await cloudinaryResponse.text()
    console.log('Cloudinary raw response:', responseText)

    let cloudinaryData
    try {
      cloudinaryData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Cloudinary response:', responseText)
      return new Response(
        JSON.stringify({ error: 'Invalid response from Cloudinary', details: responseText }),
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

    // Generate unique access link - using only 8 characters for shorter URLs
    const accessId = crypto.randomUUID().split('-')[0]
    const accessLink = `${accessId}`

    console.log('Generated access link:', accessLink)

    // Store file metadata in Firebase Firestore
    try {
      console.log('Saving to Firebase Firestore...')
      const docRef = await addDoc(collection(db, 'media_files'), {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        cloudinary_public_id: cloudinaryData.public_id,
        cloudinary_url: cloudinaryData.secure_url,
        access_link: accessLink,
        uploaded_at: new Date()
      })
      console.log('Firebase document created with ID:', docRef.id)
    } catch (firebaseError) {
      console.warn('Firebase storage failed, falling back to Supabase:', firebaseError)
    }

    // Save metadata to Supabase (as backup/primary)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
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
        JSON.stringify({ error: 'Failed to save file metadata', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('File uploaded successfully:', dbData)

    // Use direct Cloudinary URL as the shareable link
    const shareUrl = cloudinaryData.secure_url

    console.log('Generated share URL:', shareUrl)

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
