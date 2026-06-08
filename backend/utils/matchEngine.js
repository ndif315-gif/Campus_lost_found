/**
 * SMART MATCHING ENGINE
 * Advanced algorithm for matching lost and found items
 * Features:
 * - Fuzzy string matching (handles typos and spelling errors)
 * - Case-insensitive matching
 * - Multi-language support (English & French)
 * - Similarity scoring (0-100%)
 * - SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution
 */

class StringMatcher {
    /**
     * Calculate Levenshtein distance between two strings
     * (fuzzy matching - handles typos and spelling errors)
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {number} Distance (0 = identical, higher = more different)
     */
    static levenshteinDistance(a, b) {
        const aPair = [a, b];
        const bPair = [b, a];
        
        // Use the shorter string for optimization
        if (aPair[0].length > aPair[1].length) {
            const tmp = aPair[0];
            aPair[0] = aPair[1];
            aPair[1] = tmp;
        }

        const aLength = aPair[0].length;
        const bLength = aPair[1].length;

        if (aLength === 0) return bLength;

        let previousRow = Array.from({ length: aLength + 1 }, (_, i) => i);

        for (let i = 1; i <= bLength; i++) {
            const currentRow = [i];
            
            for (let j = 1; j <= aLength; j++) {
                const cost = aPair[0][j - 1] === aPair[1][i - 1] ? 0 : 1;
                currentRow.push(
                    Math.min(
                        previousRow[j] + 1,           // deletion
                        currentRow[j - 1] + 1,        // insertion
                        previousRow[j - 1] + cost     // substitution
                    )
                );
            }
            
            previousRow = currentRow;
        }

        return previousRow[aLength];
    }

    /**
     * Calculate similarity percentage between two strings
     * Handles: typos, case sensitivity, and partial matches
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Similarity percentage (0-100)
     */
    static similarity(str1, str2) {
        if (!str1 || !str2) return 0;

        // Normalize strings: lowercase and trim
        const normalized1 = str1.toLowerCase().trim();
        const normalized2 = str2.toLowerCase().trim();

        // Exact match
        if (normalized1 === normalized2) return 100;

        // Check if one contains the other (substring match)
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            return 80;
        }

        // Levenshtein distance-based similarity
        const distance = this.levenshteinDistance(normalized1, normalized2);
        const maxLength = Math.max(normalized1.length, normalized2.length);
        const similarity = Math.max(0, ((maxLength - distance) / maxLength) * 100);

        return Math.round(similarity);
    }

    /**
     * Remove common words (stop words) to improve matching
     * @param {string} text - Input text
     * @returns {string} Filtered text
     */
    static removeStopWords(text) {
        const stopWords = [
            'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
            'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'un', 'une', 'le', 'la', 'les', 'et', 'ou', 'est', 'sont'
        ];
        
        return text
            .toLowerCase()
            .split(/\s+/)
            .filter(word => !stopWords.includes(word))
            .join(' ');
    }
}

class MatchEngine {
    /**
     * Weight configuration for matching algorithm
     * Each factor contributes to overall match score
     */
    static MATCH_WEIGHTS = {
        category: 0.25,      // Category match is very important
        itemName: 0.25,      // Item name is very important
        brand: 0.15,         // Brand provides good matching info
        color: 0.15,         // Color is a distinguishing factor
        description: 0.20    // Description has detailed info
    };

    /**
     * Calculate match score between lost and found items
     * @param {Object} lostItem - Lost item object
     * @param {Object} foundItem - Found item object
     * @returns {number} Match score (0-100)
     */
    static calculateScore(lostItem, foundItem) {
        if (!lostItem || !foundItem) return 0;

        let totalScore = 0;

        // Category matching (weighted 25%)
        const categoryScore = StringMatcher.similarity(
            lostItem.category || '',
            foundItem.category || ''
        );
        totalScore += categoryScore * this.MATCH_WEIGHTS.category;

        // Item name matching (weighted 25%)
        const itemNameScore = StringMatcher.similarity(
            lostItem.item_name || '',
            foundItem.item_name || ''
        );
        totalScore += itemNameScore * this.MATCH_WEIGHTS.itemName;

        // Brand matching (weighted 15%)
        const brandScore = StringMatcher.similarity(
            lostItem.brand || '',
            foundItem.brand || ''
        );
        totalScore += brandScore * this.MATCH_WEIGHTS.brand;

        // Color matching (weighted 15%)
        const colorScore = StringMatcher.similarity(
            lostItem.color || '',
            foundItem.color || ''
        );
        totalScore += colorScore * this.MATCH_WEIGHTS.color;

        // Description matching (weighted 20%)
        // Remove stop words for better description matching
        const lostDesc = StringMatcher.removeStopWords(lostItem.description || '');
        const foundDesc = StringMatcher.removeStopWords(foundItem.description || '');
        const descriptionScore = StringMatcher.similarity(lostDesc, foundDesc);
        totalScore += descriptionScore * this.MATCH_WEIGHTS.description;

        // Return rounded score between 0 and 100
        return Math.round(Math.min(100, Math.max(0, totalScore)));
    }

    /**
     * Find all matches for a single lost item against all found items
     * @param {Object} lostItem - Lost item object
     * @param {Array} foundItems - Array of found items
     * @param {number} minimumScore - Minimum match score threshold (default: 50)
     * @returns {Array} Array of matches with score >= threshold
     */
    static findMatches(lostItem, foundItems, minimumScore = 50) {
        if (!lostItem || !Array.isArray(foundItems) || foundItems.length === 0) {
            return [];
        }

        return foundItems
            .map(foundItem => ({
                lost_item_id: lostItem.id,
                found_item_id: foundItem.id,
                score: this.calculateScore(lostItem, foundItem),
                lostItem,
                foundItem
            }))
            .filter(match => match.score >= minimumScore)
            .sort((a, b) => b.score - a.score); // Sort by score descending
    }

    /**
     * Find all matches for all lost items
     * Useful for bulk matching when new found item is added
     * @param {Array} lostItems - Array of lost items
     * @param {Array} foundItems - Array of found items
     * @param {number} minimumScore - Minimum match score threshold
     * @returns {Array} Array of all matches
     */
    static findAllMatches(lostItems, foundItems, minimumScore = 50) {
        if (!Array.isArray(lostItems) || !Array.isArray(foundItems)) {
            return [];
        }

        const allMatches = [];

        for (const lostItem of lostItems) {
            const matches = this.findMatches(lostItem, foundItems, minimumScore);
            allMatches.push(...matches);
        }

        // Return top 100 matches sorted by score
        return allMatches
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
    }

    /**
     * Get match statistics for analysis
     * @param {Array} matches - Array of matches
     * @returns {Object} Statistics object
     */
    static getMatchStatistics(matches) {
        if (!Array.isArray(matches) || matches.length === 0) {
            return {
                totalMatches: 0,
                averageScore: 0,
                highQualityMatches: 0,
                scoreDistribution: {}
            };
        }

        const scores = matches.map(m => m.score);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highQuality = matches.filter(m => m.score >= 75).length;

        // Score distribution (10-20%, 20-30%, etc.)
        const distribution = {};
        for (let i = 1; i <= 10; i++) {
            const min = i * 10;
            const max = min + 10;
            distribution[`${min}-${max}%`] = matches.filter(
                m => m.score >= min && m.score < max
            ).length;
        }

        return {
            totalMatches: matches.length,
            averageScore: Math.round(average),
            highQualityMatches: highQuality,
            scoreDistribution: distribution
        };
    }
}

module.exports = {
    MatchEngine,
    StringMatcher
};