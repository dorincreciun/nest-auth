export const VALIDATION_MESSAGES = {
    FIRST_NAME: {
        STRING: 'Prenumele trebuie să fie un text.',
        NOT_EMPTY: 'Prenumele este obligatoriu.',
        MIN_LENGTH: 'Prenumele trebuie să aibă cel puțin 2 caractere.',
        MAX_LENGTH: 'Prenumele nu poate depăși 50 de caractere.',
        INVALID_CHARS: 'Prenumele poate conține doar litere, spații sau cratimă.',
    },
    LAST_NAME: {
        STRING: 'Numele trebuie să fie un text.',
        NOT_EMPTY: 'Numele este obligatoriu.',
        MIN_LENGTH: 'Numele trebuie să aibă cel puțin 2 caractere.',
        MAX_LENGTH: 'Numele nu poate depăși 50 de caractere.',
        INVALID_CHARS: 'Numele poate conține doar litere, spații sau cratimă.',
    },
    EMAIL: {
        INVALID: 'Adresa de email nu este validă.',
        NOT_EMPTY: 'Adresa de email este obligatorie.',
        MAX_LENGTH: 'Email-ul nu poate depăși 250 de caractere.',
    },
    PASSWORD: {
        STRING: 'Parola trebuie să fie un text.',
        NOT_EMPTY: 'Parola este obligatorie.',
        MIN_LENGTH: 'Parola trebuie să aibă cel puțin 8 caractere.',
        MAX_LENGTH: 'Parola nu poate depăși 250 de caractere.',
    }
} as const;