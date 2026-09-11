ALTER TABLE "harikos"."users"
  ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'customer';

DO $$
DECLARE
  developer_user_id uuid;
  matching_users integer;
BEGIN
  SELECT count(DISTINCT u.id), (array_agg(DISTINCT u.id))[1]
  INTO matching_users, developer_user_id
  FROM harikos.users u
  JOIN harikos.projects p ON p.owner_id = u.id
  JOIN harikos.repositories r ON r.project_id = p.id
  WHERE lower(r.owner) = 'ashyeager'
    AND lower(r.name) = 'harikos.ai';

  IF matching_users <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one existing HARIKOS repository owner; found %', matching_users;
  END IF;

  UPDATE harikos.users
  SET role = 'developer', updated_at = now()
  WHERE id = developer_user_id;
END $$;

ALTER TABLE "harikos"."users"
  DROP CONSTRAINT IF EXISTS "users_role_check";
ALTER TABLE "harikos"."users"
  ADD CONSTRAINT "users_role_check" CHECK (role IN ('customer', 'developer'));
