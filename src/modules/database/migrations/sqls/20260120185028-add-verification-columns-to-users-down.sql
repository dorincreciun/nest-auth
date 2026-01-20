ALTER TABLE users
    DROP COLUMN IF EXISTS is_verified,
    DROP COLUMN IF EXISTS verification_token;