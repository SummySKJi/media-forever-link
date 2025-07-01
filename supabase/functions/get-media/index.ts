
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Get media function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let accessLink: string | null = null

    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url)
      accessLink = url.searchParams.get('id')
      console.log('GET request - access link:', accessLink)
    } else if (req.method === 'POST') {
      try {
        const body = await req.json()
        accessLink = body.id
        console.log('POST request - access link:', accessLink)
      } catch (e) {
        console.error('Failed to parse request body:', e)
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (!accessLink) {
      console.error('No access link provided')
      return new Response(
        JSON.stringify({ error: 'Access link required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Querying database for access link:', accessLink)

    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('access_link', accessLink)
      .single()

    console.log('Database query result:', { data: !!data, error })

    if (error) {
      console.error('Database error:', error)
      
      // Handle specific error codes
      if (error.code === 'PGRST116') {
        console.log('File not found in database')
        return new Response(
          JSON.stringify({ error: 'File not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      console.log('No file found for access link:', accessLink)
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Firebase credentials for enhanced verification
    const firebaseStorageBucket = Deno.env.get('FIREBASE_STORAGE_BUCKET')
    const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY')

    // If Firebase is configured, verify file exists in Firebase
    if (firebaseStorageBucket && firebaseApiKey && data.cloudinary_public_id) {
      try {
        console.log('Verifying file exists in Firebase:', data.cloudinary_public_id)
        
        const firebaseCheckUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseStorageBucket}/o/${encodeURIComponent(data.cloudinary_public_id)}`
        const firebaseCheckResponse = await fetch(firebaseCheckUrl)
        
        if (firebaseCheckResponse.ok) {
          console.log('File verified in Firebase')
          const firebaseDownloadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseStorageBucket}/o/${encodeURIComponent(data.cloudinary_public_id)}?alt=media&token=${firebaseApiKey}`
          
          // Update the URL to Firebase download URL
          data.cloudinary_url = firebaseDownloadUrl
        } else {
          console.log('File not found in Firebase, using stored URL')
        }
      } catch (firebaseError) {
        console.error('Firebase verification error:', firebaseError)
        // Continue with stored URL if Firebase check fails
      }
    }

    console.log('File found successfully:', data.id)

    return new Response(
      JSON.stringify({ 
        file: data,
        source: 'firebase'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get media error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
