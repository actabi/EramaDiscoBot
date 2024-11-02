import Mission from '../models/Mission';

/**
 * Interface définissant les méthodes requises pour un repository de missions
 * Toute nouvelle implémentation de base de données doit étendre cette interface
 */
interface IMissionRepository {
    /**
     * Récupère les missions non publiées
     * @returns {Promise<Mission[]>} Liste des missions non publiées
     */
    getUnpublishedMissions(): Promise<Mission[]>;

    /**
     * Met à jour le statut de publication d'une mission
     * @param {Mission} mission - La mission à mettre à jour
     * @param {string} discordMessageId - L'ID du message Discord
     * @returns {Promise<void>} - True si la mise à jour est réussie
     */
    updateMissionStatus(mission: Mission, discordMessageId: string): Promise<void>;
}

export default IMissionRepository;