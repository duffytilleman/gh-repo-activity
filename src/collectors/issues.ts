import { Octokit } from '@octokit/rest';
import { Issue } from '../types/index.js';

export async function collectIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: Date,
  until: Date,
  verbose = false
): Promise<Issue[]> {
  const issues: Issue[] = [];
  let page = 1;
  const perPage = 100;

  try {
    // Get all issues (open and closed)
    while (true) {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      let foundOldIssue = false;
      for (const issue of data) {
        // Skip pull requests (GitHub API includes PRs in issues endpoint)
        if (issue.pull_request) continue;

        const createdDate = new Date(issue.created_at);
        const updatedDate = new Date(issue.updated_at);

        // Skip issues that are too old
        if (updatedDate < since) {
          foundOldIssue = true;
          break;
        }

        // Only include issues created or updated in our time range
        if (createdDate >= since && createdDate <= until) {
          issues.push({
            number: issue.number,
            title: issue.title,
            author: issue.user?.login || 'unknown',
            created_at: issue.created_at,
            closed_at: issue.closed_at,
            state: issue.state as 'open' | 'closed',
            labels: issue.labels.map(label => typeof label === 'string' ? label : label.name || ''),
            comments_count: issue.comments,
          });
        }
      }

      if (verbose) {
        console.log(`  🐛 Collected ${issues.length} issues so far...`);
      }

      if (foundOldIssue || data.length < perPage) break;
      page++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (verbose) {
      console.log(`  ✅ Total issues collected: ${issues.length}`);
    }

    return issues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error('Error collecting issues:', error);
    throw error;
  }
}