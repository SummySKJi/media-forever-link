
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Get media function called with method:', req.method)
  console.log('Request URL:', req.url)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let accessLink: string | null = null;

    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url)
      accessLink = url.searchParams.get('id')
      console.log('GET request - access link from query:', accessLink)
    } else if (req.method === 'POST') {
      try {
        const body = await req.json()
        accessLink = body.id
        console.log('POST request - access link from body:', accessLink)
      } catch (e) {
        console.error('Failed to parse request body:', e)
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Final access link to search for:', accessLink)

    if (!accessLink) {
      console.error('No access link provided')
      return new Response(
        JSON.stringify({ error: 'Access link required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try Firebase first if configured
    let firebaseData = null
    try {
      const firebaseConfig = {
        apiKey: Deno.env.get('FIREBASE_API_KEY'),
        authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN'),
        projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
        storageBucket: Deno.env.get('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID'),
        appId: Deno.env.get('FIREBASE_APP_ID')
      }

      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        console.log('Checking Firebase for file...')
        
        const firebaseApiKey = firebaseConfig.apiKey
        const projectId = firebaseConfig.projectId
        
        // Query Firebase using REST API
        const queryResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/media_files?key=${firebaseApiKey}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        
        if (queryResponse.ok) {
          const queryData = await queryResponse.json()
          console.log('Firebase query response:', queryData)
          
          if (queryData.documents) {
            for (const doc of queryData.documents) {
              if (doc.fields.access_link?.stringValue === accessLink) {
                firebaseData = {
                  id: doc.name.split('/').pop(),
                  file_name: doc.fields.file_name?.stringValue,
                  file_type: doc.fields.file_type?.stringValue,
                  file_size: parseInt(doc.fields.file_size?.integerValue || '0'),
                  cloudinary_url: doc.fields.cloudinary_url?.stringValue,
                  cloudinary_public_id: doc.fields.cloudinary_public_id?.stringValue,
                  access_link: doc.fields.access_link?.stringValue,
                  uploaded_at: doc.fields.uploaded_at?.timestampValue
                }
                console.log('File found in Firebase:', firebaseData)
                break
              }
            }
          }
        } else {
          console.warn('Firebase query failed with status:', queryResponse.status)
        }
      }
    } catch (firebaseError) {
      console.warn('Firebase query failed, falling back to Supabase:', firebaseError)
    }

    // If not found in Firebase, try Supabase
    let data = firebaseData
    if (!data) {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
      
      console.log('Supabase URL check:', !!supabaseUrl)
      console.log('Supabase Key check:', !!supabaseKey)
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables')
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)

      console.log('Querying Supabase database for access link:', accessLink)

      const { data: supabaseData, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('access_link', accessLink)
        .single()

      console.log('Supabase query result:', { data: supabaseData, error })

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

      data = supabaseData
    }

    if (!data) {
      console.log('No file found for access link:', accessLink)
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('File found successfully:', data)

    return new Response(
      JSON.stringify({ 
        file: data,
        source: firebaseData ? 'firebase' : 'supabase'
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
