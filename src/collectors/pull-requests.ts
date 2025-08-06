import { Octokit } from '@octokit/rest';
import { PullRequest } from '../types/index';

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
          const pullRequest = {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || 'unknown',
            created_at: pr.created_at,
            merged_at: pr.merged_at,
            closed_at: pr.closed_at,
            state: (pr.merged_at ? 'merged' : 'closed') as 'open' | 'closed' | 'merged',
            reviews: [] as Array<{ reviewer: string; state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED'; submitted_at: string }>,
            comments_count: 0,
          };
          
          pullRequests.push(pullRequest);
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
            state: 'open' as 'open' | 'closed' | 'merged',
            reviews: [] as Array<{ reviewer: string; state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED'; submitted_at: string }>,
            comments_count: 0,
          });
        }
      }

      if (foundOldPR || data.length < perPage) break;
      page++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Fetch review data for PRs within time range (limited to avoid excessive API calls)
    const prsForReviews = pullRequests.filter(pr => {
      const prDate = new Date(pr.created_at);
      return prDate >= since && prDate <= until;
    });
    
    if (verbose) {
      console.log(`  🔍 Fetching review data for ${prsForReviews.length} PRs in time range...`);
    }
    
    for (const pr of prsForReviews) {
      try {
        const { data: reviews } = await octokit.rest.pulls.listReviews({
          owner,
          repo,
          pull_number: pr.number,
        });

        pr.reviews = reviews
          .filter(review => review.state !== 'DISMISSED' && review.user)
          .map(review => ({
            reviewer: review.user?.login || 'unknown',
            state: review.state as 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED',
            submitted_at: review.submitted_at || new Date().toISOString(),
          }));

        await new Promise(resolve => setTimeout(resolve, 50)); // Rate limiting
      } catch (error) {
        if (verbose) {
          console.log(`    ⚠️  Could not fetch reviews for PR #${pr.number}`);
        }
      }
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