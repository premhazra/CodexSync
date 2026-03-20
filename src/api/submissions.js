// ─── LeetCode GraphQL API (raw fetch, no graphql library) ─────────

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? match[1] : '';
}

async function gqlRequest(query, variables = {}) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
      Referer: 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);
  const json = await response.json();
  return json.data;
}

// ─── Queries ──────────────────────────────────────────

const SUBMISSION_DETAILS_QUERY = `
  query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      runtime
      runtimeDisplay
      runtimePercentile
      runtimeDistribution
      memory
      memoryDisplay
      memoryPercentile
      memoryDistribution
      code
      timestamp
      statusCode
      lang {
        name
        verboseName
      }
      question {
        questionId
        titleSlug
        title
        translatedTitle
        difficulty
        topicTags { name slug }
        categoryTitle
      }
      totalCorrect
      totalTestcases
    }
  }
`;

const RECENT_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const SUBMISSION_LIST_QUERY = `
  query submissionList($questionSlug: String!, $offset: Int, $limit: Int, $status: Int) {
    questionSubmissionList(
      questionSlug: $questionSlug
      offset: $offset
      limit: $limit
      status: $status
    ) {
      lastKey
      hasNext
      submissions {
        id
        title
        titleSlug
        status
        statusDisplay
        lang
        langName
        runtime
        timestamp
        memory
      }
    }
  }
`;

// ─── Exports ──────────────────────────────────────────

export async function getSubmissionDetails(submissionId) {
  const data = await gqlRequest(SUBMISSION_DETAILS_QUERY, {
    submissionId: Number(submissionId),
  });
  return data?.submissionDetails ?? null;
}

export async function getRecentSubmissions(username, limit = 20) {
  const data = await gqlRequest(RECENT_SUBMISSIONS_QUERY, { username, limit });
  return data?.recentAcSubmissionList ?? [];
}

/**
 * Get the latest accepted submission for a problem by slug.
 * status: 10 = Accepted
 */
export async function getLatestAcceptedBySlug(questionSlug) {
  const data = await gqlRequest(SUBMISSION_LIST_QUERY, {
    questionSlug,
    offset: 0,
    limit: 5,
    status: 10, // 10 = Accepted
  });
  const list = data?.questionSubmissionList?.submissions;
  return list && list.length > 0 ? list[0] : null;
}
