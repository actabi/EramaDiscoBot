const IMissionRepository = require('../interfaces/IMissionRepository');

class MissionService {
    constructor(repository) {
        // Vérifie que le repository implémente bien l'interface
        if (!(repository instanceof IMissionRepository)) {
            throw new Error('Repository must implement IMissionRepository');
        }
        this.repository = repository;
    }

    /**
     * Récupère les missions non publiées avec validation et traitement
     * @returns {Promise<Array>} Liste des missions filtrées et validées
     */
    async getUnpublishedMissions() {
        try {
            const missions = await this.repository.getUnpublishedMissions();
            
            // Filtre les missions invalides
            return missions.filter(mission => {
                // Vérifie les champs obligatoires
                if (!mission.title || !mission.description) {
                    console.warn(`Mission ${mission.id} skipped: missing required fields`);
                    return false;
                }

                // Vérifie le prix
                if (mission.price && (mission.price < 0 || mission.price > 100000)) {
                    console.warn(`Mission ${mission.id} skipped: invalid price range`);
                    return false;
                }

                // Autres validations métier
                return true;
            });
        } catch (error) {
            console.error('Error in getUnpublishedMissions:', error);
            throw new Error('Failed to fetch unpublished missions');
        }
    }

    /**
     * Met à jour le statut d'une mission avec validation
     * @param {Mission} mission - La mission à mettre à jour
     * @param {string} discordMessageId - L'ID du message Discord
     * @returns {Promise<boolean>}
     */
    async updateMissionStatus(mission, discordMessageId) {
        try {
            if (!mission || !mission.id) {
                throw new Error('Invalid mission object');
            }

            if (!discordMessageId) {
                throw new Error('Discord message ID is required');
            }

            // Vérifie si la mission n'est pas déjà publiée
            if (mission.isPublished) {
                console.warn(`Mission ${mission.id} is already published`);
                return false;
            }

            const updated = await this.repository.updateMissionStatus(mission, discordMessageId);
            
            if (updated) {
                this.logMissionUpdate(mission, discordMessageId);
            }

            return updated;
        } catch (error) {
            console.error(`Error updating mission ${mission?.id}:`, error);
            throw new Error('Failed to update mission status');
        }
    }

    /**
     * Recherche des missions par critères
     * @param {Object} criteria - Critères de recherche
     * @returns {Promise<Array>} Missions correspondantes
     */
    async searchMissions(criteria) {
        try {
            const missions = await this.repository.getUnpublishedMissions();
            
            return missions.filter(mission => {
                // Filtre par compétences
                if (criteria.skills && criteria.skills.length > 0) {
                    const hasRequiredSkills = criteria.skills.every(
                        skill => mission.skills.includes(skill)
                    );
                    if (!hasRequiredSkills) return false;
                }

                // Filtre par localisation
                if (criteria.location && mission.location !== criteria.location) {
                    return false;
                }

                // Filtre par fourchette de prix
                if (criteria.minPrice && mission.price < criteria.minPrice) {
                    return false;
                }
                if (criteria.maxPrice && mission.price > criteria.maxPrice) {
                    return false;
                }

                return true;
            });
        } catch (error) {
            console.error('Error in searchMissions:', error);
            throw new Error('Failed to search missions');
        }
    }

    /**
     * Valide une mission avant publication
     * @param {Mission} mission - La mission à valider
     * @returns {Object} Résultat de la validation
     */
    validateMission(mission) {
        const errors = [];
        const warnings = [];

        // Vérifie les champs obligatoires
        if (!mission.title) errors.push('Title is required');
        if (!mission.description) errors.push('Description is required');
        
        // Vérifie les formats
        if (mission.price && typeof mission.price !== 'number') {
            errors.push('Price must be a number');
        }

        // Avertissements pour les bonnes pratiques
        if (mission.description && mission.description.length < 50) {
            warnings.push('Description is quite short, consider adding more details');
        }
        
        if (!mission.skills || mission.skills.length === 0) {
            warnings.push('No skills specified');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Log les mises à jour de mission pour audit
     * @private
     */
    logMissionUpdate(mission, discordMessageId) {
        const updateLog = {
            timestamp: new Date(),
            missionId: mission.id,
            discordMessageId: discordMessageId,
            title: mission.title,
            action: 'PUBLICATION'
        };
        
        console.log('Mission Update:', JSON.stringify(updateLog));
        // Ici vous pourriez ajouter la persistance des logs dans un fichier
        // ou une base de données
    }
}

module.exports = MissionService;