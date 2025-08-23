# Database Setup Documentation

## Admin Authentication Setup

### 1. admin_users Table Structure
The `admin_users` table is used to manage administrator permissions:

```sql
-- Table columns:
- id (uuid) - Links to Supabase Auth user ID
- username (text)
- password_hash (text) - Managed by Supabase Auth
- role (user_role ENUM: 'admin', 'user')
- is_active (boolean)
- permissions (text[])
- last_login (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 2. Adding Admin User
To add an admin user, first create the user in Supabase Authentication, then:

```sql
INSERT INTO admin_users (
    id,
    username,
    password_hash,
    role,
    is_active,
    permissions,
    created_at,
    updated_at
) VALUES (
    'USER_ID_FROM_AUTH',  -- Copy from Authentication > Users
    'admin@example.com',
    'managed_by_supabase_auth',
    'admin'::user_role,
    true,
    ARRAY['all', 'admin', 'write', 'read'],
    NOW(),
    NOW()
);
```

### 3. RLS Policies

```sql
-- Allow users to view their own admin record
CREATE POLICY "Users can view own admin record"
ON admin_users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own last_login
CREATE POLICY "Users can update own last_login"
ON admin_users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 4. login_logs Table RLS

```sql
-- Allow authenticated users to insert their own login logs
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."login_logs"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

## Troubleshooting

### 406 Error on admin_users Query
This happens when querying USER-DEFINED types. Solution: Ensure the admin user exists in the admin_users table with proper role assignment.

### 403 Forbidden on login_logs
Add the INSERT policy shown above to allow authenticated users to log their login attempts.

## Security Notes
- Never store actual passwords in admin_users table
- Always use Supabase Auth for password management
- The admin_users table only stores role and permission metadata