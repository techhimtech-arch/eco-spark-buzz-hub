-- Create daily_tasks table for mini eco tasks
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  task_description TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 10,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_completed DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON public.daily_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
ON public.daily_tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Create blog_bookmarks table
CREATE TABLE public.blog_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blog_id)
);

-- Enable RLS
ALTER TABLE public.blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
ON public.blog_bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookmarks"
ON public.blog_bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.blog_bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- Add total_points column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;