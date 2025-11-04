-- Create security definer helper functions to avoid RLS recursion
create or replace function public.is_group_member(_user_id uuid, _group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where user_id = _user_id and group_id = _group_id
  );
$$;

create or replace function public.is_group_owner(_user_id uuid, _group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups
    where id = _group_id and created_by = _user_id
  );
$$;

-- Replace policies to use helper functions
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;
CREATE POLICY "Users can view their groups"
ON public.groups
FOR SELECT
USING (
  auth.uid() = created_by OR public.is_group_member(auth.uid(), id)
);

DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_group_owner(auth.uid(), group_id)
  OR public.is_group_member(auth.uid(), group_id)
);