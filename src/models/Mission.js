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
}

module.exports = Mission;