import { Octokit } from '@octokit/rest';
import { PullRequest } from '../types/index.js';

export async function collectPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: Date,
  until: Date,
  verbose = false
): Promise<PullRequest[]> {
  const pullRequests: PullRequest[] = [];
  let page = 1;
  const perPage = 100;

  try {
    // Get closed PRs first
    while (true) {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      let foundOldPR = false;
      for (const pr of data) {
        const createdDate = new Date(pr.created_at);
        const updatedDate = new Date(pr.updated_at);

        // Skip PRs that are too old
        if (updatedDate < since) {
          foundOldPR = true;
          break;
        }

        // Only include PRs created or updated in our time range
        if (createdDate >= since && createdDate <= until) {
          pullRequests.push({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || 'unknown',
            created_at: pr.created_at,
            merged_at: pr.merged_at,
            closed_at: pr.closed_at,
            state: pr.merged_at ? 'merged' : 'closed',
            reviews_count: 0, // Will be populated separately if needed
            comments_count: pr.comments,
          });
        }
      }

      if (foundOldPR || data.length < perPage) break;
      page++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Get open PRs
    page = 1;
    while (true) {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      let foundOldPR = false;
      for (const pr of data) {
        const createdDate = new Date(pr.created_at);

        if (createdDate < since) {
          foundOldPR = true;
          break;
        }

        if (createdDate >= since && createdDate <= until) {
          pullRequests.push({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || 'unknown',
            created_at: pr.created_at,
            merged_at: null,
            closed_at: null,
            state: 'open',
            reviews_count: 0,
            comments_count: pr.comments,
          });
        }
      }

      if (foundOldPR || data.length < perPage) break;
      page++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (verbose) {
      console.log(`  ✅ Total pull requests collected: ${pullRequests.length}`);
    }

    return pullRequests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error('Error collecting pull requests:', error);
    throw error;
  }
}