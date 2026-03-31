-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  email TEXT,
  role TEXT DEFAULT 'User',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create server_requests table
CREATE TABLE server_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  server_name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('PvP', 'PvE', 'PvX')),
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Brutal')),
  language TEXT CHECK (language IN ('Arabic', 'English')),
  players_count INTEGER DEFAULT 1,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Server Requests Policies
CREATE POLICY "Accepted requests are viewable by everyone." ON server_requests FOR SELECT USING (status = 'Accepted' OR auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Owner'));
CREATE POLICY "Users can insert their own requests." ON server_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners and Admins can update any request." ON server_requests FOR UPDATE USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Owner'));
CREATE POLICY "Owners and Admins can delete any request." ON server_requests FOR DELETE USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Owner'));

-- Notifications Policies
CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications." ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Storage Setup (Run in Supabase Storage Dashboard)
-- Create a bucket named 'server-hub-bucket'
-- Set it to public and allow authenticated uploads to 'server-images/' and 'avatars/'
