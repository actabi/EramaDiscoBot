const IMissionRepository = require('../interfaces/IMissionRepository');

/**
 * Service de gestion des missions
 */
class MissionService {
    /**
     * @param {IMissionRepository} repository - Repository implémentant IMissionRepository
     */
    constructor(repository) {
        // Vérifie que le repository implémente bien l'interface
        if (!(repository instanceof IMissionRepository)) {
            throw new Error('Repository must implement IMissionRepository');
        }
        this.repository = repository;
        
        // Constantes de validation
        this.VALIDATION = {
            MIN_DESCRIPTION_LENGTH: 50,
            MIN_PRICE: 0,
            MAX_PRICE: 100000
        };
    }

    /**
     * Récupère les missions non publiées avec validation et traitement
     * @returns {Promise<Array>} Liste des missions filtrées et validées
     */
    async getUnpublishedMissions() {
        try {
          console.log('Fetching unpublished missions...');
          const missions = await this.repository.getUnpublishedMissions();
          console.log(`Found ${missions.length} unpublished missions`);
      
          const validMissions = missions.filter(mission => {
            const validation = this.validateMission(mission);
            if (!validation.isValid) {
              console.warn(`Mission ${mission.id} skipped:`, validation.errors.join(', '));
              return false;
            }
      
            if (validation.warnings.length > 0) {
              console.warn(`Mission ${mission.id} warnings:`, validation.warnings.join(', '));
            }
      
            return true;
          });
      
          console.log(`Returning ${validMissions.length} valid missions`);
          return validMissions;
        } catch (error) {
          console.error('Error in getUnpublishedMissions:', error);
          throw new Error(`Failed to fetch unpublished missions: ${error.message}`);
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
            if (!mission?.id) {
                throw new Error('Invalid mission object');
            }

            if (!discordMessageId) {
                throw new Error('Discord message ID is required');
            }

            const validation = this.validateMission(mission);
            if (!validation.isValid) {
                throw new Error(`Invalid mission: ${validation.errors.join(', ')}`);
            }

            if (mission.isPublished) {
                console.warn(`Mission ${mission.id} is already published`);
                return false;
            }

            const updated = await this.repository.updateMissionStatus(mission, discordMessageId);
            
            if (updated) {
                await this.logMissionUpdate(mission, discordMessageId);
                console.log(`Mission ${mission.id} successfully updated with Discord message ID ${discordMessageId}`);
            }

            return updated;
        } catch (error) {
            console.error(`Error updating mission ${mission?.id}:`, error);
            throw new Error(`Failed to update mission status: ${error.message}`);
        }
    }

    /**
     * Recherche des missions par critères
     * @param {Object} criteria - Critères de recherche
     * @param {string[]} [criteria.skills] - Compétences requises
     * @param {string} [criteria.location] - Localisation
     * @param {number} [criteria.minPrice] - Prix minimum
     * @param {number} [criteria.maxPrice] - Prix maximum
     * @returns {Promise<Array>} Missions correspondantes
     */
    async searchMissions(criteria) {
        try {
            console.log('Searching missions with criteria:', criteria);
            const missions = await this.repository.getUnpublishedMissions();
            
            const filteredMissions = missions.filter(mission => {
                // Filtre par compétences
                if (criteria.skills?.length > 0) {
                    const hasRequiredSkills = criteria.skills.every(
                        skill => mission.skills?.includes(skill)
                    );
                    if (!hasRequiredSkills) return false;
                }

                // Filtre par localisation
                if (criteria.location && mission.location !== criteria.location) {
                    return false;
                }

                // Filtre par fourchette de prix
                if (criteria.minPrice != null && (mission.price == null || mission.price < criteria.minPrice)) {
                    return false;
                }
                if (criteria.maxPrice != null && (mission.price == null || mission.price > criteria.maxPrice)) {
                    return false;
                }

                return true;
            });

            console.log(`Found ${filteredMissions.length} missions matching criteria`);
            return filteredMissions;
        } catch (error) {
            console.error('Error in searchMissions:', error);
            throw new Error(`Failed to search missions: ${error.message}`);
        }
    }

    /**
     * Valide une mission
     * @param {Mission} mission - La mission à valider
     * @returns {Object} Résultat de la validation {isValid, errors, warnings}
     */
    validateMission(mission) {
        const errors = [];
        const warnings = [];

        // Vérifications essentielles
        if (!mission) {
            errors.push('Mission object is required');
            return { isValid: false, errors, warnings };
        }

        // Vérifie les champs obligatoires
        if (!mission.title) errors.push('Title is required');
        if (!mission.description) errors.push('Description is required');
        if (!mission.id) errors.push('ID is required');
        
        // Vérifie les formats
        if (mission.price != null) {
            if (typeof mission.price !== 'number') {
                errors.push('Price must be a number');
            } else if (mission.price < this.VALIDATION.MIN_PRICE || mission.price > this.VALIDATION.MAX_PRICE) {
                errors.push(`Price must be between ${this.VALIDATION.MIN_PRICE} and ${this.VALIDATION.MAX_PRICE}`);
            }
        }

        // Avertissements pour les bonnes pratiques
        if (mission.description && mission.description.length < this.VALIDATION.MIN_DESCRIPTION_LENGTH) {
            warnings.push(`Description is quite short (${mission.description.length} chars), consider adding more details`);
        }
        
        if (!mission.skills?.length) {
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
     * @param {Mission} mission - La mission mise à jour
     * @param {string} discordMessageId - L'ID du message Discord
     * @private
     */
    async logMissionUpdate(mission, discordMessageId) {
        const updateLog = {
            timestamp: new Date().toISOString(),
            missionId: mission.id,
            discordMessageId,
            title: mission.title,
            action: 'PUBLICATION',
            status: mission.isPublished ? 'PUBLISHED' : 'PENDING'
        };
        
        console.log('Mission Update:', JSON.stringify(updateLog, null, 2));
        // TODO: Implémenter la persistance des logs
        // Exemple: await this.logRepository.save(updateLog);
    }
}

module.exports = MissionService;