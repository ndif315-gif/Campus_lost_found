/**
 * MATCH CONTROLLER
 * Responsibility: orchestrate matching logic when called.
 * OOP/SOLID notes:
 * - Single Responsibility (SRP): this module triggers matching and notification flows only.
 * - Dependency Inversion (DIP): ideally this would depend on an abstract MatchService; currently it uses the DB directly.
 * - Open/Closed (OCP): matching strategy is currently inline but can be replaced by `utils/matchEngine.js` without changing controller API.
 */

const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Match = require("../models/Match");
const Notification = require("../models/Notification");
const { MatchEngine } = require("../utils/matchEngine");

exports.findMatches = async () => {
    try {
        const lostItems = await LostItem.findSearching();
        const foundItems = await FoundItem.findAvailable();

        for (const lost of lostItems) {
            for (const found of foundItems) {
                // Calculate score using MatchEngine
                const score = MatchEngine.calculateScore(lost, found);

                if (score >= 50) { // Threshold for a match
                    await Match.create({
                        lost_item_id: lost.id,
                        found_item_id: found.id,
                        score: score
                    });

                    await Notification.create({
                        user_id: lost.user_id,
                        type: 'match',
                        title: 'New Match Found!',
                        message: `We found a possible match for your lost item: ${lost.item_name}. Match score: ${score}%`,
                        action_url: `/matches/${lost.id}`
                    });

                    // Also notify the person who found it
                    await Notification.create({
                        user_id: found.user_id,
                        type: 'match',
                        title: 'Match for Found Item',
                        message: `Someone is looking for an item similar to the one you found: ${found.item_name}.`,
                        action_url: `/matches/found/${found.id}`
                    });
                }
            }
        }
    } catch (error) {
        console.error("Match matching error:", error);
    }
};