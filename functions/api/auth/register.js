// Register endpoint
let users = new Map(); // Shared with login.js in production

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { name, email, password, gender } = await request.json();

    console.log('Registration attempt for:', email);

    // Validate input
    if (!name || !email || !password || !gender) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 6 characters long'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User with this email already exists'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, hash this password
      gender,
      avatar: '',
      createdAt: new Date().toISOString()
    };

    // Store user
    users.set(email, newUser);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log('User registered successfully:', email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
      token: 'demo-jwt-token-' + Date.now()
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Registration failed: ' + error.message
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