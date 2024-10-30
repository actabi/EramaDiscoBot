/**
 * Classe représentant une mission
 * Standardise la structure des données quelle que soit la source
 */
class Mission {
    constructor({
        id,
        title,
        description,
        skills = [],
        experienceLevel,
        duration,
        location,
        price,
        workType,
        missionType,
        isPublished = false,
        discordMessageId = null,
        createdAt = new Date()
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.skills = skills;
        this.experienceLevel = experienceLevel;
        this.duration = duration;
        this.location = location;
        this.price = price;
        this.workType = workType;
        this.missionType = missionType;
        this.isPublished = isPublished;
        this.discordMessageId = discordMessageId;
        this.createdAt = createdAt;
    }

    /**
     * Convertit l'objet Mission en objet JSON
     * @returns {Object} Représentation JSON de la mission
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            skills: this.skills,
            experienceLevel: this.experienceLevel,
            duration: this.duration,
            location: this.location,
            price: this.price,
            workType: this.workType,
            missionType: this.missionType,
            isPublished: this.isPublished,
            discordMessageId: this.discordMessageId,
            createdAt: this.createdAt
        };
    }

    /**
     * Vérifie si la mission est valide
     * @returns {Object} Résultat de la validation {isValid: boolean, errors: string[]}
     */
    validate() {
        const errors = [];

        if (!this.id) errors.push('ID is required');
        if (!this.title) errors.push('Title is required');
        if (!this.description) errors.push('Description is required');
        if (this.price && typeof this.price !== 'number') errors.push('Price must be a number');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Marque la mission comme publiée
     * @param {string} discordMessageId - ID du message Discord
     */
    markAsPublished(discordMessageId) {
        this.isPublished = true;
        this.discordMessageId = discordMessageId;
    }

    /**
     * Crée une copie de la mission
     * @returns {Mission} Nouvelle instance de Mission
     */
    clone() {
        return new Mission(this.toJSON());
    }
}

module.exports = Mission;