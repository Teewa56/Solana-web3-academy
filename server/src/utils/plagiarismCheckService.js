const axios = require('axios');
const crypto = require('crypto');
const Submission = require('../modules/models/submissionModel');
const logger = require('./logger');

class PlagiarismService {
    constructor() {
        // Using Copyleaks API or similar plagiarism detection service
        this.apiKey = process.env.PLAGIARISM_API_KEY;
        this.apiUrl = process.env.PLAGIARISM_API_URL || 'https://api.copyleaks.com';
        this.similarityThreshold = 0.7; // 70% similarity threshold
    }

    // Calculate similarity between two texts using Levenshtein distance
    calculateSimilarity(text1, text2) {
        const longer = text1.length > text2.length ? text1 : text2;
        const shorter = text1.length > text2.length ? text2 : text1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    // Levenshtein distance algorithm
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    // Normalize text for comparison
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    // Calculate hash of text for quick comparison
    calculateHash(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    // Check against previous submissions (internal plagiarism check)
    async checkInternalPlagiarism(content, assignmentId, currentStudentId) {
        try {
            const normalizedContent = this.normalizeText(content);
            const contentHash = this.calculateHash(normalizedContent);

            // Get all submissions for this assignment (excluding current student)
            const previousSubmissions = await Submission.find({
                assignment: assignmentId,
                student: { $ne: currentStudentId }
            }).populate('student', 'user');

            const matches = [];

            for (const submission of previousSubmissions) {
                if (!submission.content) continue;

                const normalizedSubmission = this.normalizeText(submission.content);
                const submissionHash = this.calculateHash(normalizedSubmission);

                // Quick check: if hashes match, it's identical
                if (contentHash === submissionHash) {
                    matches.push({
                        studentId: submission.student._id,
                        similarity: 1.0,
                        matchType: 'exact'
                    });
                    continue;
                }

                // Detailed similarity check
                const similarity = this.calculateSimilarity(normalizedContent, normalizedSubmission);

                if (similarity >= this.similarityThreshold) {
                    matches.push({
                        studentId: submission.student._id,
                        similarity: similarity,
                        matchType: 'similar'
                    });
                }
            }

            const isPlagiarized = matches.length > 0;
            const maxSimilarity = matches.length > 0
                ? Math.max(...matches.map(m => m.similarity))
                : 0;

            return {
                passed: !isPlagiarized,
                similarity: maxSimilarity,
                matches: matches,
                checkType: 'internal'
            };
        } catch (error) {
            logger.error('Error in internal plagiarism check:', error);
            throw error;
        }
    }

    // Check against external sources using API (if available)
    async checkExternalPlagiarism(content) {
        try {
            if (!this.apiKey) {
                logger.warn('External plagiarism API key not configured');
                return {
                    passed: true,
                    similarity: 0,
                    sources: [],
                    checkType: 'external_skipped'
                };
            }

            // Example API call to Copyleaks or similar service
            const response = await axios.post(
                `${this.apiUrl}/v3/scans/submit`,
                {
                    text: content,
                    properties: {
                        webhookUrl: `${process.env.BACKEND_URL}/api/v1/webhooks/plagiarism`
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                passed: response.data.score < this.similarityThreshold,
                similarity: response.data.score || 0,
                sources: response.data.results || [],
                scanId: response.data.scanId,
                checkType: 'external'
            };
        } catch (error) {
            logger.error('Error in external plagiarism check:', error);
            // Return pass on API error to not block student
            return {
                passed: true,
                similarity: 0,
                sources: [],
                error: error.message,
                checkType: 'external_error'
            };
        }
    }

    // Comprehensive plagiarism check
    async checkPlagiarism(content, assignmentId, studentId) {
        try {
            logger.info(`Starting plagiarism check for student ${studentId}, assignment ${assignmentId}`);

            // Run both internal and external checks
            const [internalResult, externalResult] = await Promise.all([
                this.checkInternalPlagiarism(content, assignmentId, studentId),
                this.checkExternalPlagiarism(content)
            ]);

            const overallPassed = internalResult.passed && externalResult.passed;
            const maxSimilarity = Math.max(internalResult.similarity, externalResult.similarity);

            const result = {
                passed: overallPassed,
                overallSimilarity: maxSimilarity,
                internal: internalResult,
                external: externalResult,
                timestamp: new Date()
            };

            logger.info(`Plagiarism check completed. Passed: ${overallPassed}, Similarity: ${maxSimilarity}`);

            return result;
        } catch (error) {
            logger.error('Error in comprehensive plagiarism check:', error);
            throw error;
        }
    }

    // Check assignment against answer key
    async checkAgainstAnswerKey(content, answerKey) {
        try {
            const normalizedContent = this.normalizeText(content);
            const normalizedAnswer = this.normalizeText(answerKey);

            // Calculate similarity
            const similarity = this.calculateSimilarity(normalizedContent, normalizedAnswer);

            // Extract keywords from answer key
            const keywords = this.extractKeywords(normalizedAnswer);
            const keywordsFound = keywords.filter(keyword => 
                normalizedContent.includes(keyword)
            );

            const keywordMatchPercentage = keywords.length > 0
                ? (keywordsFound.length / keywords.length)
                : 0;

            // Consider it passed if similarity is high OR most keywords are present
            const passed = similarity >= 0.6 || keywordMatchPercentage >= 0.7;

            return {
                passed: passed,
                similarity: similarity,
                keywordMatchPercentage: keywordMatchPercentage,
                totalKeywords: keywords.length,
                matchedKeywords: keywordsFound.length,
                missingKeywords: keywords.filter(k => !keywordsFound.includes(k))
            };
        } catch (error) {
            logger.error('Error checking against answer key:', error);
            throw error;
        }
    }

    // Extract keywords from text (simple implementation)
    extractKeywords(text) {
        const commonWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
            'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);

        const words = text.toLowerCase().split(/\s+/);
        const keywords = words.filter(word => 
            word.length > 3 && !commonWords.has(word)
        );

        // Return unique keywords
        return [...new Set(keywords)];
    }

    // Generate plagiarism report
    generateReport(plagiarismResult) {
        const report = {
            summary: {
                passed: plagiarismResult.passed,
                overallSimilarity: `${(plagiarismResult.overallSimilarity * 100).toFixed(2)}%`,
                timestamp: plagiarismResult.timestamp
            },
            internalCheck: {
                passed: plagiarismResult.internal.passed,
                similarity: `${(plagiarismResult.internal.similarity * 100).toFixed(2)}%`,
                matchesFound: plagiarismResult.internal.matches.length,
                details: plagiarismResult.internal.matches.map(match => ({
                    similarity: `${(match.similarity * 100).toFixed(2)}%`,
                    type: match.matchType
                }))
            },
            externalCheck: {
                passed: plagiarismResult.external.passed,
                similarity: `${(plagiarismResult.external.similarity * 100).toFixed(2)}%`,
                sourcesFound: plagiarismResult.external.sources?.length || 0,
                checkType: plagiarismResult.external.checkType
            }
        };

        return report;
    }
}

// Singleton instance
const plagiarismService = new PlagiarismService();

module.exports = plagiarismService;