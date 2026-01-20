CREATE TABLE refresh_tokens
(
    id         SERIAL PRIMARY KEY,
    token_hash TEXT                     NOT NULL,
    user_id    INTEGER                  NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_refresh_tokens
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id)