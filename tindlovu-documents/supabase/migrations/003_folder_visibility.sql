-- Tindlovu Documents — folder visibility
-- Hide branches and sections that the current user cannot access.

-- Check whether the current user should SEE a section in the navigation tree.
-- Returns true when the user has permission on:
--   - the section itself,
--   - any ancestor (navigation root → permitted descendant), or
--   - any descendant (permitted parent → children are visible).
CREATE OR REPLACE FUNCTION has_section_visibility(section_uuid uuid) RETURNS boolean AS $$
  WITH RECURSIVE ancestors AS (
    SELECT s.id, s.parent_id FROM sections s WHERE s.id = section_uuid
    UNION ALL
    SELECT s.id, s.parent_id FROM sections s
    INNER JOIN ancestors a ON s.id = a.parent_id
  ),
  descendants AS (
    SELECT s.id FROM sections s WHERE s.id = section_uuid
    UNION ALL
    SELECT s.id FROM sections s
    INNER JOIN descendants d ON s.parent_id = d.id
  )
  SELECT is_super_admin() OR EXISTS (
    SELECT 1 FROM permissions
    WHERE user_id = auth.uid() AND section_id IN (
      SELECT id FROM ancestors UNION SELECT id FROM descendants
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Branches: only show branches where the user has at least one permission.
DROP POLICY IF EXISTS "Authenticated users can select branches" ON branches;
CREATE POLICY "Authenticated users can select branches" ON branches FOR SELECT USING (
  is_super_admin() OR EXISTS (
    SELECT 1 FROM permissions
    WHERE permissions.branch_id = branches.id
    AND permissions.user_id = auth.uid()
  )
);

-- Sections: use has_section_visibility instead of the old branch-level check.
DROP POLICY IF EXISTS "Users can select permitted sections" ON sections;
CREATE POLICY "Users can select permitted sections" ON sections FOR SELECT USING (
  has_section_visibility(id)
);
