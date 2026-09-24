export class AuditService {
    /**
     * Genera un D1PreparedStatement para registrar una acción en la tabla Auditoria.
     * Esta función debe usarse siempre dentro de un `env.DB.batch()`.
     * 
     * @param {D1Database} db - La instancia de la base de datos D1 (env.DB).
     * @param {number|string} userId - El ID del usuario que realiza la acción.
     * @param {string} tableName - El nombre de la tabla afectada.
     * @param {string} recordId - El ID del registro afectado.
     * @param {string} action - 'INSERT', 'UPDATE', o 'DELETE'.
     * @param {object|null} oldValue - El estado del registro antes del cambio (opcional).
     * @param {object|null} newValue - El estado del registro después del cambio (opcional).
     * @param {string|null} ipOrigin - La IP de origen de la solicitud HTTP.
     * @returns {D1PreparedStatement} - El statement de Cloudflare D1 listo para batch().
     */
    static generateLogStmt(db, userId, tableName, recordId, action, oldValue = null, newValue = null, ipOrigin = null) {
        const query = `
            INSERT INTO Auditoria (id_usuario, tabla_afectada, registro_id, accion, valor_anterior, valor_nuevo, ip_origen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return db.prepare(query).bind(
            userId,
            tableName,
            String(recordId),
            action,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
            ipOrigin
        );
    }

    /**
     * Helper para verificar que un usuario tiene el rol necesario antes de realizar una operación transaccional.
     */
    static requireRole(userPayload, allowedRoles) {
        if (!userPayload || !userPayload.role || !allowedRoles.includes(userPayload.role)) {
            throw new Error("Permisos insuficientes para realizar esta operación.");
        }
        return true;
    }
}
