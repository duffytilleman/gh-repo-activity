export interface RepositoryData {
  repository: {
    name: string;
    metadata: {
      description: string | null;
      languages: string[];
      created_at: string;
      updated_at: string;
      stars: number;
      forks: number;
    };
    collection_date: string;
    time_range: {
      start: string;
      end: string;
    };
  };
  commits: Commit[];
  pull_requests: PullRequest[];
  issues: Issue[];
  contributors: Contributor[];
  analytics: Analytics;
}

export interface Commit {
  sha: string;
  author: string;
  author_name: string;
  date: string;
  message: string;
  files_changed: number;
  additions: number;
  deletions: number;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  state: 'open' | 'closed' | 'merged';
  reviews_count: number;
  comments_count: number;
}

export interface Issue {
  number: number;
  title: string;
  author: string;
  created_at: string;
  closed_at: string | null;
  state: 'open' | 'closed';
  labels: string[];
  comments_count: number;
}

export interface Contributor {
  login: string;
  name: string | null;
  commits: number;
  pull_requests: number;
  issues: number;
  first_contribution: string;
  last_contribution: string;
}

export interface Analytics {
  commit_frequency: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  pr_metrics: {
    total: number;
    merged: number;
    closed: number;
    open: number;
    average_merge_time_hours: number | null;
  };
  issue_metrics: {
    total: number;
    open: number;
    closed: number;
    average_close_time_hours: number | null;
  };
  contributor_patterns: {
    top_contributors: Array<{ login: string; commits: number }>;
    new_contributors: string[];
    active_contributors: string[];
  };
}

export interface CollectOptions {
  since?: string;
  until?: string;
  output?: string;
  token?: string;
  verbose?: boolean;
  include?: string[];
}

export interface GenerateOptions {
  template?: string;
  theme?: string;
  output?: string;
  title?: string;
}