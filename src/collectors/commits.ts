import { Octokit } from '@octokit/rest';
import { Commit } from '../types/index.js';

export async function collectCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: Date,
  until: Date,
  verbose = false
): Promise<Commit[]> {
  const commits: Commit[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        until: until.toISOString(),
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      for (const commit of data) {
        if (!commit.commit.author?.date) continue;

        const commitDate = new Date(commit.commit.author.date);
        if (commitDate < since || commitDate > until) continue;

        commits.push({
          sha: commit.sha,
          author: commit.author?.login || 'unknown',
          author_name: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author.date,
          message: commit.commit.message,
          files_changed: commit.files?.length || 0,
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0,
        });
      }

      if (verbose) {
        console.log(`  📝 Collected ${commits.length} commits so far...`);
      }

      if (data.length < perPage) break;
      page++;

      // Rate limiting - GitHub allows 5000 requests per hour
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (verbose) {
      console.log(`  ✅ Total commits collected: ${commits.length}`);
    }

    return commits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error collecting commits:', error);
    throw error;
  }
}