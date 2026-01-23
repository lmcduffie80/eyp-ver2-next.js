// Utility to parse DJ names from review comments
// Matches first name, last name, or full name mentions

import sql from '../db/connection.js';

let djNameCache = null;
let djCacheTime = null;
const DJ_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all DJs and build name variations map
 * @returns {Promise<Map<string, string>>} Map of name variations to username
 */
async function buildDJNameMap() {
    // Check cache
    const now = Date.now();
    if (djNameCache && djCacheTime && (now - djCacheTime) < DJ_CACHE_DURATION) {
        return djNameCache;
    }

    // Fetch all DJs from database
    const result = await sql`
        SELECT username, first_name, last_name 
        FROM users 
        WHERE user_type = 'dj'
    `;

    const nameMap = new Map();

    result.rows.forEach(dj => {
        const username = dj.username;
        const firstName = dj.first_name?.trim();
        const lastName = dj.last_name?.trim();
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}`.trim() : null;

        // Store all variations (lowercase for case-insensitive matching)
        if (username) {
            nameMap.set(username.toLowerCase(), username);
        }
        if (firstName) {
            nameMap.set(firstName.toLowerCase(), username);
        }
        if (lastName) {
            nameMap.set(lastName.toLowerCase(), username);
        }
        if (fullName) {
            nameMap.set(fullName.toLowerCase(), username);
        }
    });

    // Cache the result
    djNameCache = nameMap;
    djCacheTime = now;

    return nameMap;
}

/**
 * Parse DJ name from review comment or explicit DJ field
 * @param {string} comment - The review comment text
 * @param {string|null} explicitDjUsername - Explicitly provided DJ username (takes priority)
 * @returns {Promise<string|null>} Matched DJ username or null
 */
export async function parseDJName(comment, explicitDjUsername = null) {
    try {
        // If DJ username explicitly provided, use it (takes priority)
        if (explicitDjUsername) {
            return explicitDjUsername;
        }

        // If no comment, can't parse
        if (!comment || typeof comment !== 'string') {
            return null;
        }

        // Build DJ name map
        const djNameMap = await buildDJNameMap();

        // Tokenize the comment into words (remove punctuation, normalize)
        const words = comment
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(w => w.length > 0);

        // Also check for multi-word names (2 consecutive words)
        const twoWordPhrases = [];
        for (let i = 0; i < words.length - 1; i++) {
            twoWordPhrases.push(`${words[i]} ${words[i + 1]}`);
        }

        // Check two-word phrases first (full names have priority)
        for (const phrase of twoWordPhrases) {
            if (djNameMap.has(phrase)) {
                const matchedUsername = djNameMap.get(phrase);
                console.log(`[DJ Parser] Matched full name: "${phrase}" -> ${matchedUsername}`);
                return matchedUsername;
            }
        }

        // Then check single words (first or last name)
        for (const word of words) {
            if (djNameMap.has(word)) {
                const matchedUsername = djNameMap.get(word);
                console.log(`[DJ Parser] Matched single name: "${word}" -> ${matchedUsername}`);
                return matchedUsername;
            }
        }

        console.log('[DJ Parser] No DJ name found in comment');
        return null;

    } catch (error) {
        console.error('[DJ Parser] Error parsing DJ name:', error);
        return null;
    }
}

export default parseDJName;
