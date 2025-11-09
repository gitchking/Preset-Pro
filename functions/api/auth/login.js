// Login endpoint
let users = new Map(); // In-memory storage for demo (would be database in production)

// Add some demo users for testing
users.set('demo@presetpro.com', {
  id: '1',
  name: 'Demo User',
  email: 'demo@presetpro.com',
  password: 'demo123', // In production, this would be hashed
  gender: 'prefer-not-to-say',
  avatar: '',
  createdAt: new Date().toISOString()
});

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if user exists
    const user = users.get(email);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify password (in production, use proper password hashing)
    if (user.password !== password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: 'demo-jwt-token-' + Date.now()
    }), {
      status: 200,
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