// ─── LeetCode Handler ─────────────────────────────────
import { getSubmissionDetails, getLatestAcceptedBySlug } from '../api/submissions.js';

export default class LeetCodeHandler {
  /**
   * Extract submission ID from a LeetCode submission URL.
   * e.g. https://leetcode.com/problems/two-sum/submissions/1234567/
   */
  static parseSubmissionId(url) {
    const match = url.match(/\/submissions\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract problem slug from a LeetCode URL.
   * e.g. https://leetcode.com/problems/two-sum/... → "two-sum"
   */
  static parseProblemSlug(url) {
    const match = url.match(/\/problems\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Fetch full submission details from LeetCode GraphQL API.
   * Returns a normalized submission object ready for GitHub push.
   */
  async getSubmission(submissionId) {
    const details = await getSubmissionDetails(submissionId);
    if (!details) return null;

    return {
      id: submissionId,
      title: details.question?.title || 'Unknown',
      titleSlug: details.question?.titleSlug || 'unknown',
      difficulty: details.question?.difficulty || 'Unknown',
      language: details.lang?.verboseName || details.lang?.name || 'Unknown',
      code: details.code || '',
      runtime: details.runtimeDisplay || '',
      memory: details.memoryDisplay || '',
      timestamp: details.timestamp ? Number(details.timestamp) * 1000 : Date.now(),
      tags: (details.question?.topicTags || []).map((t) => t.name),
    };
  }

  /**
   * Fallback: get latest accepted submission by problem slug,
   * then fetch its full details.
   */
  async getSubmissionBySlug(slug) {
    const latest = await getLatestAcceptedBySlug(slug);
    if (!latest?.id) return null;
    return this.getSubmission(String(latest.id));
  }
}
