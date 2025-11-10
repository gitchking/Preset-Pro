// Login endpoint - Now using Supabase Auth
import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  try {
    // Return a message indicating that frontend should use Supabase client directly
    return new Response(JSON.stringify({
      success: false,
      error: 'Use Supabase Auth client directly instead of this endpoint',
      message: 'Authentication is now handled by Supabase Auth. Please use the Supabase client in your frontend code.'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Login failed: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}