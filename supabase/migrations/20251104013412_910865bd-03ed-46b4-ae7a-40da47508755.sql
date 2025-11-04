-- Fix infinite recursion in RLS policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

-- Create fixed policy for groups - allow viewing if user created it or is a member
CREATE POLICY "Users can view their groups"
ON public.groups
FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  id IN (
    SELECT group_id 
    FROM group_members 
    WHERE user_id = auth.uid()
  )
);

-- Create fixed policy for group_members - simpler approach
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  group_id IN (
    SELECT id 
    FROM groups 
    WHERE created_by = auth.uid()
  )
  OR
  group_id IN (
    SELECT group_id 
    FROM group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);