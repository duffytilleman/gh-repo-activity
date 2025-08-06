import { Octokit } from '@octokit/rest';
import { RepositoryData, CollectOptions } from '../types/index';
import { collectCommits } from './commits';
import { collectPullRequests } from './pull-requests';
import { collectIssues } from './issues';
import { analyzeData } from '../utils/analytics';

export async function collectData(repo: string, options: CollectOptions): Promise<RepositoryData> {
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('Repository must be in format "owner/repo"');
  }

  const octokit = new Octokit({
    auth: options.token,
  });

  if (options.verbose) {
    console.log(`📡 Connecting to GitHub API for ${repo}...`);
  }

  try {
    // Get repository metadata
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo: repoName,
    });

    // Get repository languages
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner,
      repo: repoName,
    });

    if (options.verbose) {
      console.log(`📋 Repository: ${repoData.full_name} (${repoData.stargazers_count} stars, ${repoData.forks_count} forks)`);
    }

    const since = options.since ? new Date(options.since) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const until = options.until ? new Date(options.until) : new Date();

    // Initialize data structure
    const repositoryData: RepositoryData = {
      repository: {
        name: repo,
        metadata: {
          description: repoData.description,
          languages: Object.keys(languages),
          created_at: repoData.created_at,
          updated_at: repoData.updated_at,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
        },
        collection_date: new Date().toISOString(),
        time_range: {
          start: since.toISOString(),
          end: until.toISOString(),
        },
      },
      commits: [],
      pull_requests: [],
      issues: [],
      contributors: [],
      analytics: {
        commit_frequency: { daily: [], weekly: [], monthly: [] },
        pr_metrics: { total: 0, merged: 0, closed: 0, open: 0, average_merge_time_hours: null },
        pr_breakdown: { by_user: [], by_week: [], weekly_velocity: [] },
        issue_metrics: { total: 0, open: 0, closed: 0, average_close_time_hours: null },
        contributor_patterns: { top_contributors: [], new_contributors: [], active_contributors: [] },
      },
    };

    const include = options.include || ['commits', 'prs', 'issues'];

    // Collect data based on options
    if (include.includes('commits')) {
      if (options.verbose) console.log('📝 Collecting commits...');
      repositoryData.commits = await collectCommits(octokit, owner, repoName, since, until, options.verbose);
    }

    if (include.includes('prs')) {
      if (options.verbose) console.log('🔀 Collecting pull requests...');
      repositoryData.pull_requests = await collectPullRequests(octokit, owner, repoName, since, until, options.verbose);
    }

    if (include.includes('issues')) {
      if (options.verbose) console.log('🐛 Collecting issues...');
      repositoryData.issues = await collectIssues(octokit, owner, repoName, since, until, options.verbose);
    }

    // Generate analytics and contributor data
    if (options.verbose) console.log('📊 Generating analytics...');
    repositoryData.analytics = analyzeData(repositoryData);
    repositoryData.contributors = generateContributors(repositoryData);

    return repositoryData;
  } catch (error) {
    if (error instanceof Error) {
      if ('status' in error && error.status === 404) {
        throw new Error(`Repository ${repo} not found or not accessible`);
      }
      if ('status' in error && error.status === 401) {
        throw new Error('GitHub token is invalid or has insufficient permissions');
      }
      if ('status' in error && error.status === 403) {
        throw new Error('GitHub API rate limit exceeded or insufficient permissions');
      }
    }
    throw error;
  }
}

function generateContributors(data: RepositoryData) {
  const contributorMap = new Map();

  // Count contributions from commits
  data.commits.forEach(commit => {
    const login = commit.author;
    if (!contributorMap.has(login)) {
      contributorMap.set(login, {
        login,
        name: commit.author_name,
        commits: 0,
        pull_requests: 0,
        issues: 0,
        first_contribution: commit.date,
        last_contribution: commit.date,
      });
    }
    const contributor = contributorMap.get(login);
    contributor.commits++;
    if (commit.date < contributor.first_contribution) {
      contributor.first_contribution = commit.date;
    }
    if (commit.date > contributor.last_contribution) {
      contributor.last_contribution = commit.date;
    }
  });

  // Count contributions from PRs
  data.pull_requests.forEach(pr => {
    const login = pr.author;
    if (!contributorMap.has(login)) {
      contributorMap.set(login, {
        login,
        name: null,
        commits: 0,
        pull_requests: 0,
        issues: 0,
        first_contribution: pr.created_at,
        last_contribution: pr.created_at,
      });
    }
    const contributor = contributorMap.get(login);
    contributor.pull_requests++;
    if (pr.created_at < contributor.first_contribution) {
      contributor.first_contribution = pr.created_at;
    }
    if (pr.created_at > contributor.last_contribution) {
      contributor.last_contribution = pr.created_at;
    }
  });

  // Count contributions from issues
  data.issues.forEach(issue => {
    const login = issue.author;
    if (!contributorMap.has(login)) {
      contributorMap.set(login, {
        login,
        name: null,
        commits: 0,
        pull_requests: 0,
        issues: 0,
        first_contribution: issue.created_at,
        last_contribution: issue.created_at,
      });
    }
    const contributor = contributorMap.get(login);
    contributor.issues++;
    if (issue.created_at < contributor.first_contribution) {
      contributor.first_contribution = issue.created_at;
    }
    if (issue.created_at > contributor.last_contribution) {
      contributor.last_contribution = issue.created_at;
    }
  });

  return Array.from(contributorMap.values());
}