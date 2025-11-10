-- Users table for future authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    gender TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Categories table for organizing presets
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#8B5CF6', -- Purple theme color
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presets table with proper schema
CREATE TABLE IF NOT EXISTS presets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    effects TEXT[], -- Array of effect types
    file_url TEXT NOT NULL, -- URL to the preset file
    file_type TEXT NOT NULL, -- .ffx, .aep, etc.
    thumbnail_url TEXT, -- URL to preview image
    author_name TEXT,
    author_email TEXT,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preset categories junction table
CREATE TABLE IF NOT EXISTS preset_categories (
    preset_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (preset_id, category_id),
    FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Add table for storing uploaded files
CREATE TABLE IF NOT EXISTS preset_files (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    content_type TEXT,
    file_data TEXT NOT NULL, -- Base64 encoded file data
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('Transitions', 'Smooth transitions between scenes', '#8B5CF6'),
('Text Effects', 'Animated text and typography effects', '#06B6D4'),
('Camera Movements', 'Dynamic camera animations', '#10B981'),
('Color Grading', 'Professional color correction presets', '#F59E0B'),
('Glitch Effects', 'Digital distortion and glitch effects', '#EF4444'),
('Light Effects', 'Lighting and glow effects', '#F97316'),
('Motion Graphics', 'Animated graphic elements', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presets_status ON presets(status);
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON presets(created_at);
CREATE INDEX IF NOT EXISTS idx_presets_downloads ON presets(downloads);
CREATE INDEX IF NOT EXISTS idx_presets_likes ON presets(likes);
CREATE INDEX IF NOT EXISTS idx_preset_files_id ON preset_files(id);

-- Enable RLS (Row Level Security) on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE presets TO authenticated;
GRANT ALL ON TABLE categories TO authenticated;
GRANT ALL ON TABLE preset_categories TO authenticated;
GRANT ALL ON TABLE preset_files TO authenticated;