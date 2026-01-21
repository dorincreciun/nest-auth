export const AUTH_RESPONSES = {
    ERRORS: {
        // Validare DTO
        INVALID_EMAIL: 'Vă rugăm să introduceți o adresă de email validă.',
        PASSWORD_TOO_SHORT: 'Parola trebuie să aibă cel puțin 6 caractere.',
        PASSWORD_TOO_LONG: 'Parola este prea lungă (maxim 100 caractere).',

        // Logica de Business
        EMAIL_CONFLICT: 'Această adresă de email este deja utilizată.',
        INVALID_CREDENTIALS: 'Email-ul sau parola sunt incorecte.',
        UNAUTHORIZED: 'Nu aveți permisiunea de a accesa această resursă.',
        SESSION_EXPIRED: 'Sesiunea a expirat. Vă rugăm să vă logați din nou.',
        USER_NOT_FOUND: 'Utilizatorul nu a fost găsit.',
        INTERNAL_ERROR: 'A apărut o eroare neprevăzută. Vă rugăm să încercați mai târziu.',
    },
    SUCCESS: {
        REGISTERED: 'Contul a fost creat cu succes.',
        LOGGED_IN: 'Autentificare reușită.',
        LOGOUT: 'V-ați delogat cu succes.',
    }
} as const;