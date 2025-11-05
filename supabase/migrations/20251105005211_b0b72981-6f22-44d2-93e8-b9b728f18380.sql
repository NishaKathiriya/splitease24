-- Allow group members to create expenses for any payer within their group
CREATE POLICY "Group members can create expenses for any payer in group"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT gm.group_id FROM public.group_members gm
    WHERE gm.user_id = auth.uid()
  )
  AND payer_id IN (
    SELECT gm.user_id FROM public.group_members gm
    WHERE gm.group_id = group_id
  )
);

-- Allow group members to create splits for any expense in their groups
CREATE POLICY "Group members can create splits for group expenses"
ON public.expense_splits
FOR INSERT
TO authenticated
WITH CHECK (
  expense_id IN (
    SELECT e.id FROM public.expenses e
    WHERE e.group_id IN (
      SELECT gm.group_id FROM public.group_members gm
      WHERE gm.user_id = auth.uid()
    )
  )
);
