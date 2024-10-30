/**
 * Interface définissant les méthodes requises pour un repository de missions
 * Toute nouvelle implémentation de base de données doit étendre cette interface
 */
class IMissionRepository {
    /**
     * Récupère les missions non publiées
     * @returns {Promise<Array>} Liste des missions non publiées
     */
    async getUnpublishedMissions() {
        throw new Error('Method getUnpublishedMissions must be implemented');
    }

    /**
     * Met à jour le statut de publication d'une mission
     * @param {Object} mission - La mission à mettre à jour
     * @param {string} discordMessageId - L'ID du message Discord
     * @returns {Promise<boolean>} - True si la mise à jour est réussie
     */
    async updateMissionStatus(mission, discordMessageId) {
        throw new Error('Method updateMissionStatus must be implemented');
    }
}

module.exports = IMissionRepository;