-- Presets table to store After Effects presets
CREATE TABLE IF NOT EXISTS presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    effects TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    download_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT '.ffx',
    description TEXT,
    author_name TEXT,
    author_email TEXT,
    tags TEXT, -- JSON array of tags
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' -- pending, approved, rejected
);

-- Users table for future authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table for organizing presets
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#8B5CF6', -- Purple theme color
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Preset categories junction table
CREATE TABLE IF NOT EXISTS preset_categories (
    preset_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (preset_id, category_id),
    FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description, color) VALUES
('Transitions', 'Smooth transitions between scenes', '#8B5CF6'),
('Text Effects', 'Animated text and typography effects', '#06B6D4'),
('Camera Movements', 'Dynamic camera animations', '#10B981'),
('Color Grading', 'Professional color correction presets', '#F59E0B'),
('Glitch Effects', 'Digital distortion and glitch effects', '#EF4444'),
('Light Effects', 'Lighting and glow effects', '#F97316'),
('Motion Graphics', 'Animated graphic elements', '#8B5CF6');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presets_status ON presets(status);
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON presets(created_at);
CREATE INDEX IF NOT EXISTS idx_presets_downloads ON presets(downloads);
CREATE INDEX IF NOT EXISTS idx_presets_likes ON presets(likes);