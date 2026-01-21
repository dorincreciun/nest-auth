export function camelToSnakeCase(string: string): string {
    return string.replace(/[A-Z]/g, (match: string): string => {
        return `_${match.toLowerCase()}`
    })
}

export function mapObjectKeysToSql(keys: string[]): string {
    return keys.map((key: string, index: number): string => {
        const column = camelToSnakeCase(key)
        return `${column} = $${index + 1}`
    }).join(`, `)
}