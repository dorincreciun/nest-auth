export const AUTH_MESSAGES = {
    ERRORS: {
        EMAIL_CONFLICT: 'Această adresă de email este deja utilizată.',
        INVALID_CREDENTIALS: 'Email-ul sau parola sunt incorecte.',
        UNAUTHORIZED: 'Nu aveți permisiunea de a accesa această resursă.',
        SESSION_EXPIRED: 'Sesiunea a expirat. Vă rugăm să vă logați din nou.',
        USER_NOT_FOUND: 'Utilizatorul nu a fost găsit.',
    },
    SUCCESS: {
        REGISTERED: 'Contul a fost creat cu succes.',
        LOGGED_IN: 'Autentificare reușită.',
    }
} as const;