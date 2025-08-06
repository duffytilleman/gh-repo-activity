import { RepositoryData, Analytics } from '../types/index';
import { format, startOfWeek, startOfMonth, differenceInHours } from 'date-fns';

export function analyzeData(data: RepositoryData): Analytics {
  return {
    commit_frequency: analyzeCommitFrequency(data.commits),
    pr_metrics: analyzePullRequestMetrics(data.pull_requests),
    issue_metrics: analyzeIssueMetrics(data.issues),
    contributor_patterns: analyzeContributorPatterns(data.commits, data.pull_requests, data.issues),
  };
}

function analyzeCommitFrequency(commits: any[]) {
  const daily = new Map<string, number>();
  const weekly = new Map<string, number>();
  const monthly = new Map<string, number>();

  commits.forEach(commit => {
    const date = new Date(commit.date);
    
    // Daily frequency
    const dayKey = format(date, 'yyyy-MM-dd');
    daily.set(dayKey, (daily.get(dayKey) || 0) + 1);
    
    // Weekly frequency
    const weekStart = startOfWeek(date);
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    weekly.set(weekKey, (weekly.get(weekKey) || 0) + 1);
    
    // Monthly frequency
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM-dd');
    monthly.set(monthKey, (monthly.get(monthKey) || 0) + 1);
  });

  return {
    daily: Array.from(daily.entries()).map(([date, count]) => ({ date, count })),
    weekly: Array.from(weekly.entries()).map(([week, count]) => ({ week, count })),
    monthly: Array.from(monthly.entries()).map(([month, count]) => ({ month, count })),
  };
}

function analyzePullRequestMetrics(pullRequests: any[]) {
  const total = pullRequests.length;
  const merged = pullRequests.filter(pr => pr.state === 'merged').length;
  const closed = pullRequests.filter(pr => pr.state === 'closed').length;
  const open = pullRequests.filter(pr => pr.state === 'open').length;

  // Calculate average merge time for merged PRs
  const mergedPRs = pullRequests.filter(pr => pr.merged_at && pr.created_at);
  let average_merge_time_hours = null;

  if (mergedPRs.length > 0) {
    const totalHours = mergedPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      return sum + differenceInHours(merged, created);
    }, 0);
    average_merge_time_hours = Math.round(totalHours / mergedPRs.length);
  }

  return {
    total,
    merged,
    closed,
    open,
    average_merge_time_hours,
  };
}

function analyzeIssueMetrics(issues: any[]) {
  const total = issues.length;
  const open = issues.filter(issue => issue.state === 'open').length;
  const closed = issues.filter(issue => issue.state === 'closed').length;

  // Calculate average close time for closed issues
  const closedIssues = issues.filter(issue => issue.closed_at && issue.created_at);
  let average_close_time_hours = null;

  if (closedIssues.length > 0) {
    const totalHours = closedIssues.reduce((sum, issue) => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return sum + differenceInHours(closed, created);
    }, 0);
    average_close_time_hours = Math.round(totalHours / closedIssues.length);
  }

  return {
    total,
    open,
    closed,
    average_close_time_hours,
  };
}

function analyzeContributorPatterns(commits: any[], pullRequests: any[], issues: any[]) {
  // Count total contributions per user
  const contributorStats = new Map<string, number>();

  commits.forEach(commit => {
    const author = commit.author;
    contributorStats.set(author, (contributorStats.get(author) || 0) + 1);
  });

  pullRequests.forEach(pr => {
    const author = pr.author;
    contributorStats.set(author, (contributorStats.get(author) || 0) + 1);
  });

  issues.forEach(issue => {
    const author = issue.author;
    contributorStats.set(author, (contributorStats.get(author) || 0) + 1);
  });

  // Sort by contribution count and get top contributors
  const topContributors = Array.from(contributorStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([login, commits]) => ({ login, commits }));

  // Get unique contributors from recent period (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentContributors = new Set<string>();

  commits.forEach(commit => {
    if (new Date(commit.date) >= thirtyDaysAgo) {
      recentContributors.add(commit.author);
    }
  });

  pullRequests.forEach(pr => {
    if (new Date(pr.created_at) >= thirtyDaysAgo) {
      recentContributors.add(pr.author);
    }
  });

  issues.forEach(issue => {
    if (new Date(issue.created_at) >= thirtyDaysAgo) {
      recentContributors.add(issue.author);
    }
  });

  // For simplicity, consider all contributors as potentially new
  // In a real implementation, we'd need to check their first contribution date
  const allContributors = Array.from(contributorStats.keys());
  
  return {
    top_contributors: topContributors,
    new_contributors: allContributors.slice(0, 5), // Simplified
    active_contributors: Array.from(recentContributors),
  };
}