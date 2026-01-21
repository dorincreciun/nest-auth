-- 1. Ștergem constrângerile de lungime minimă
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS first_name_min_length,
    DROP CONSTRAINT IF EXISTS last_name_min_length;

-- 2. Revenim la lungimea anterioară de 150
ALTER TABLE users
    ALTER COLUMN first_name TYPE VARCHAR(150),
    ALTER COLUMN last_name TYPE VARCHAR(150);