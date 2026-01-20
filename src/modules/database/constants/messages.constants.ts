export const DATABASE_MESSAGES = {
    ERRORS: {
        NOT_FOUND: 'Resursa solicitată nu a fost găsită. 🔍',
        CREATION_FAILED: 'Eroare neașteptată la crearea înregistrării în baza de date. ❌',
        DUPLICATE_ENTRY: 'O înregistrare cu aceste date există deja. 🛑',
    },
    LOGS: {
        CONNECTION_SUCCESS: 'Conexiune reușită la PostgreSQL. 🔌',
        CONNECTION_ERROR: 'Eșec la conectarea cu PostgreSQL. ⚠️',
        POOL_CLOSED: 'Pool-ul bazei de date a fost închis cu succes. 🔒',
        QUERY_EXECUTED: (duration: number) => `Query executat în ${duration}ms ⚡`,
        QUERY_ERROR: (text: string) => `Eroare la query: ${text} ‼️`,
    }
} as const;