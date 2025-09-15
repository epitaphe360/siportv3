import { User, NetworkingRecommendation } from '../types';

// --- Helper Functions ---

/**
 * Calculates the intersection of two string arrays.
 */
const getIntersection = (arr1: string[], arr2: string[]): string[] => {
  if (!arr1 || !arr2) return [];
  const set1 = new Set(arr1.map(item => item.toLowerCase()));
  return arr2.filter(item => set1.has(item.toLowerCase()));
};

/**
 * Defines complementary objectives between users.
 * e.g., a user looking for suppliers is a good match for a user presenting products.
 */
const complementaryObjectives: Record<string, string[]> = {
  'Trouver de nouveaux partenaires': ['Développer mon réseau', 'Présenter mes innovations'],
  'Développer mon réseau': ['Trouver de nouveaux partenaires', 'Rencontrer des investisseurs'],
  'Présenter mes innovations': ['Découvrir les innovations portuaires', 'Identifier des fournisseurs'],
  'Identifier des fournisseurs': ['Présenter mes innovations', 'Explorer de nouveaux marchés'],
  'Explorer de nouveaux marchés': ['Trouver de nouveaux partenaires'],
  'Rencontrer des investisseurs': ['Présenter mes innovations'],
  'Découvrir les innovations portuaires': ['Présenter mes innovations'],
};

// --- Scoring Weights ---
// These weights determine the importance of each matching criterion.
const weights = {
  sharedInterests: 15,
  sharedSectors: 20,
  complementaryObjectives: 25,
  sameCountry: 10,
  keywordInBio: 5,
  sameCompanySize: 5,
  sharedCollaborationTypes: 20,
  // New priority weights for user types
  partnerPriority: 30, // Partners get priority over exhibitors
  exhibitorPriority: 20, // Exhibitors get priority over visitors
  availabilityBonus: 15, // Bonus for users with available time slots
};

/**
 * This service simulates an AI engine to generate networking recommendations.
 * It calculates a match score between users based on various profile attributes.
 */
class RecommendationService {
  /**
   * Generates a list of networking recommendations for a given user.
   * @param currentUser - The user for whom to generate recommendations.
   * @param allUsers - A list of all potential users to recommend.
   * @returns A promise that resolves to a sorted list of recommendations.
   */
  public static async generateRecommendations(
    currentUser: User,
    allUsers: User[]
  ): Promise<NetworkingRecommendation[]> {
    const recommendations: NetworkingRecommendation[] = [];

    // Filter out the current user and users of the same company
    const potentialMatches = allUsers.filter(
      (p) => p.id !== currentUser.id && p.profile.company !== currentUser.profile.company
    );

    for (const potentialMatch of potentialMatches) {
      const { score, reasons } = this.calculateMatchScore(currentUser, potentialMatch);

      // Only recommend users with a score above a certain threshold
      if (score > 30) {
        recommendations.push({
          id: `${currentUser.id}-${potentialMatch.id}`,
          userId: currentUser.id,
          recommendedUserId: potentialMatch.id,
          score: Math.min(100, Math.round(score)), // Cap score at 100
          reasons,
          category: 'Professional Match',
          viewed: false,
          contacted: false,
          mutualConnections: Math.floor(Math.random() * 5), // Mock data
          recommendedUser: potentialMatch,
        });
      }
    }

    // Sort recommendations by score in descending order
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculates a compatibility score between two users.
   * @param user1 - The current user.
   * @param user2 - The potential user to match with.
   * @returns An object containing the final score and the reasons for the match.
   */
  private static calculateMatchScore(user1: User, user2: User): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const p1 = user1.profile;
    const p2 = user2.profile;

    // 1. User Type Priority System
    // Partners get priority over exhibitors, exhibitors over visitors
    if (user1.type === 'visitor' && user2.type === 'exhibitor') {
      score += weights.exhibitorPriority;
      reasons.push('Priorité exposant sur visiteur');
    } else if (user1.type === 'visitor' && user2.type === 'partner') {
      score += weights.exhibitorPriority + weights.partnerPriority;
      reasons.push('Priorité partenaire sur visiteur');
    } else if (user1.type === 'exhibitor' && user2.type === 'partner') {
      score += weights.partnerPriority;
      reasons.push('Priorité partenaire sur exposant');
    }

    // Reverse priority for the other user perspective
    if (user2.type === 'visitor' && user1.type === 'exhibitor') {
      score += weights.exhibitorPriority;
      reasons.push('Vous avez la priorité en tant qu\'exposant');
    } else if (user2.type === 'visitor' && user1.type === 'partner') {
      score += weights.exhibitorPriority + weights.partnerPriority;
      reasons.push('Vous avez la priorité en tant que partenaire');
    } else if (user2.type === 'exhibitor' && user1.type === 'partner') {
      score += weights.partnerPriority;
      reasons.push('Vous avez la priorité en tant que partenaire');
    }

    // 2. Shared Interests
    const sharedInterests = getIntersection(p1.interests, p2.interests);
    if (sharedInterests.length > 0) {
      score += sharedInterests.length * weights.sharedInterests;
      reasons.push(`Partage l'intérêt pour : ${sharedInterests.join(', ')}`);
    }

    // 3. Shared Business Sectors
    const sharedSectors = getIntersection(p1.sectors, p2.sectors);
    if (sharedSectors.length > 0) {
      score += sharedSectors.length * weights.sharedSectors;
      reasons.push(`Opère dans le même secteur : ${sharedSectors.join(', ')}`);
    }

    // 4. Complementary Objectives
    p1.objectives.forEach(obj1 => {
      const complements = complementaryObjectives[obj1] || [];
      const matchingObjectives = getIntersection(complements, p2.objectives);
      if (matchingObjectives.length > 0) {
        score += matchingObjectives.length * weights.complementaryObjectives;
        reasons.push(`Objectifs complémentaires (e.g., "${obj1}" et "${matchingObjectives[0]}")`);
      }
    });

    // 5. Same Country
    if (p1.country && p2.country && p1.country.toLowerCase() === p2.country.toLowerCase()) {
      score += weights.sameCountry;
      reasons.push(`Basé(e) dans le même pays : ${p1.country}`);
    }

    // 6. Shared Collaboration Types
    const sharedCollaboration = getIntersection(p1.collaborationTypes, p2.collaborationTypes);
    if (sharedCollaboration.length > 0) {
        score += sharedCollaboration.length * weights.sharedCollaborationTypes;
        reasons.push(`Recherche des collaborations similaires : ${sharedCollaboration.join(', ')}`);
    }

    // 7. Keyword match in bio
    if (p1.bio && p2.bio) {
        const p1Keywords = new Set(p1.bio.toLowerCase().split(' '));
        const p2Keywords = p2.bio.toLowerCase().split(' ');
        const commonKeywords = p2Keywords.filter(kw => p1Keywords.has(kw) && kw.length > 3);
        if (commonKeywords.length > 0) {
            score += weights.keywordInBio;
            reasons.push(`Mentionne des mots-clés communs dans sa biographie.`);
        }
    }

    // 8. Same company size
    if (p1.companySize && p2.companySize && p1.companySize === p2.companySize) {
        score += weights.sameCompanySize;
        reasons.push(`Travaille dans une entreprise de taille similaire.`);
    }

    // 9. Availability bonus (mock for now - will be implemented with real availability system)
    // This would check if the user has available time slots
    const hasAvailability = Math.random() > 0.3; // Mock availability check
    if (hasAvailability) {
      score += weights.availabilityBonus;
      reasons.push('Disponible pour des rencontres');
    }

    return { score, reasons };
  }
}

export default RecommendationService;
