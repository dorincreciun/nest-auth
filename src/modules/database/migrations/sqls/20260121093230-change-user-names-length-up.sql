-- Modificăm lungimea coloanelor
ALTER TABLE users
    ALTER COLUMN first_name TYPE VARCHAR(50),
    ALTER COLUMN last_name TYPE VARCHAR(50);

-- Opțional: Adăugăm o constrângere pentru lungimea minimă la nivel de DB
-- Aceasta asigură că niciun proces (nu doar cel din NestJS) nu poate insera nume prea scurte
ALTER TABLE users
    ADD CONSTRAINT first_name_length_check CHECK (char_length(first_name) >= 2),
    ADD CONSTRAINT last_name_length_check CHECK (char_length(last_name) >= 2);