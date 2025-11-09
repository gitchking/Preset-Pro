-- Add table for storing uploaded files
CREATE TABLE IF NOT EXISTS preset_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    content_type TEXT,
    file_data TEXT NOT NULL, -- Base64 encoded file data
    file_size INTEGER NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_preset_files_id ON preset_files(id);