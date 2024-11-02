/**
 * Classe représentant une mission
 * Standardise la structure des données quelle que soit la source
 */
class Mission {
    id: string;
    title: string;
    description: string;
    skills: string[];
    experienceLevel?: string;
    duration?: string;
    location?: string;
    price?: number;
    workType?: string;
    missionType?: string;
    isPublished: boolean;
    discordMessageId: string | null;
    createdAt: Date;

    /**
     * @param {Object} params - Paramètres de la mission
     * @param {string} params.id - ID unique de la mission
     * @param {string} params.title - Titre de la mission
     * @param {string} params.description - Description de la mission
     * @param {string[]} [params.skills=[]] - Compétences requises
     * @param {string} [params.experienceLevel] - Niveau d'expérience requis
     * @param {string} [params.duration] - Durée de la mission
     * @param {string} [params.location] - Localisation
     * @param {number} [params.price] - Prix proposé
     * @param {string} [params.workType] - Type de travail (remote, sur site, etc.)
     * @param {string} [params.missionType] - Type de mission (temps plein, partiel, etc.)
     * @param {boolean} [params.isPublished=false] - Statut de publication
     * @param {string|null} [params.discordMessageId=null] - ID du message Discord associé
     * @param {Date} [params.createdAt=new Date()] - Date de création
     */
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
      createdAt = new Date(),
    }: {
      id: string;
      title: string;
      description: string;
      skills?: string[];
      experienceLevel?: string;
      duration?: string;
      location?: string;
      price?: number;
      workType?: string;
      missionType?: string;
      isPublished?: boolean;
      discordMessageId?: string | null;
      createdAt?: Date;
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
}

export default Mission;