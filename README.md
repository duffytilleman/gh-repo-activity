# GitHub Repository Activity Analyzer

A TypeScript/Node.js command-line tool that analyzes GitHub repository activity and generates interactive HTML dashboards. Built with Octokit.js for GitHub API integration and Chart.js for visualizations.

## Features

### 📊 Comprehensive Analytics
- **Commit Activity**: Daily, weekly, and monthly frequency analysis
- **Pull Request Metrics**: Status tracking, merge times, and velocity analysis
- **Pull Request Breakdown**: Detailed analysis by user and week showing:
  - PRs created, merged, and reviewed per user
  - Weekly PR activity trends
  - PR velocity (opened vs closed)
  - Review activity by user
- **Issue Tracking**: Open/close rates and resolution times
- **Contributor Analysis**: Activity patterns and top contributors

### 🎨 Interactive Dashboard
- **Responsive Design**: Works on desktop and mobile
- **Multiple Chart Types**: Line charts, bar charts, doughnut charts, and more
- **Theme Support**: Light and dark themes
- **Self-contained HTML**: Offline-capable dashboards with embedded assets
- **Real-time Interaction**: Hover tooltips and interactive legends

### ⚡ Two-Phase Architecture
- **Phase 1**: Data collection from GitHub API with caching
- **Phase 2**: HTML dashboard generation from collected data
- **Flexible Workflow**: Collect once, generate multiple reports

## Installation

### Prerequisites
- Node.js v18 or higher
- GitHub Personal Access Token

### Install Dependencies
```bash
npm install
```

### Build the Project
```bash
npm run build
```

## Setup

### GitHub Authentication
Create a GitHub Personal Access Token with repository read permissions:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope for private repositories, or `public_repo` for public repositories
3. Set the token as an environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

Or create a `.env.local` file:
```bash
echo "export GITHUB_TOKEN=your_token_here" > .env.local
source .env.local
```

## Usage

### Quick Start
Analyze a repository and generate a dashboard in one command:

```bash
npm run dev -- analyze owner/repo-name
```

### Available Commands

#### 1. Complete Analysis (Recommended)
```bash
npm run dev -- analyze <owner/repo> [options]
```

**Options:**
- `--since <date>`: Start date (default: 1 year ago)
- `--until <date>`: End date (default: now)  
- `--output <file>`: HTML output path (default: ./dashboard.html)
- `--include <types>`: Data types: commits,prs,issues (default: commits,prs,issues)
- `--template <name>`: Template: standard,minimal,detailed (default: standard)
- `--theme <name>`: Theme: light,dark (default: light)
- `--token <token>`: GitHub token (or use GITHUB_TOKEN env var)
- `--keep-json`: Save intermediate JSON file
- `--verbose`: Show detailed progress

**Example:**
```bash
npm run dev -- analyze microsoft/typescript \
  --since 2024-01-01 \
  --include commits,prs \
  --theme dark \
  --output reports/typescript-report.html \
  --keep-json \
  --verbose
```

#### 2. Data Collection Only
```bash
npm run dev -- collect <owner/repo> [options]
```

**Options:**
- `--since <date>`: Start date
- `--until <date>`: End date
- `--output <file>`: JSON output path (default: ./repo-data.json)
- `--include <types>`: Data types to collect
- `--token <token>`: GitHub token
- `--verbose`: Show progress

**Example:**
```bash
npm run dev -- collect facebook/react \
  --since 2024-06-01 \
  --include commits,prs \
  --output data/react-data.json
```

#### 3. Dashboard Generation Only
```bash
npm run dev -- generate <data-file> [options]
```

**Options:**
- `--template <name>`: Template to use
- `--theme <name>`: Color theme
- `--output <file>`: HTML output path (default: ./dashboard.html)
- `--title <text>`: Custom dashboard title

**Example:**
```bash
npm run dev -- generate data/react-data.json \
  --template detailed \
  --theme dark \
  --title "React Project Dashboard" \
  --output reports/react-dashboard.html
```

## Dashboard Features

### Summary Cards
- Total commits, pull requests, issues, and contributors
- Key metrics at a glance

### Interactive Charts
1. **Commit Activity Over Time**: Line chart showing daily commit patterns
2. **Pull Request Status**: Doughnut chart showing merged/open/closed PRs
3. **Top Contributors**: Bar chart of most active contributors
4. **Issue Resolution**: Doughnut chart of open vs closed issues

### Pull Request Breakdown Section
5. **PR Activity by User**: Stacked bar chart showing created/merged/reviewed PRs per user
6. **Weekly PR Activity**: Line chart showing PR trends over time
7. **PR Velocity**: Bar chart showing opened vs closed PRs weekly
8. **Review Activity by User**: Horizontal bar chart showing review counts

### Activity Feed
- Recent commits, pull requests, and issues
- Chronological timeline of repository activity

## Examples

### Analyze a Public Repository
```bash
# Basic analysis
npm run dev -- analyze torvalds/linux --since 2024-01-01

# Focus on PR activity with review data
npm run dev -- analyze microsoft/vscode \
  --since 2024-06-01 \
  --include commits,prs \
  --theme dark \
  --verbose
```

### Analyze a Private Repository
```bash
# Requires appropriate token permissions
npm run dev -- analyze myorg/private-repo \
  --token ghp_xxxxxxxxxxxx \
  --include commits,prs \
  --keep-json
```

### Generate Multiple Reports from Same Data
```bash
# Collect data once
npm run dev -- collect facebook/react --output tmp/react.json

# Generate different themed reports
npm run dev -- generate tmp/react.json --theme light --output reports/react-light.html
npm run dev -- generate tmp/react.json --theme dark --output reports/react-dark.html
```

## Output Files

### JSON Data File
Contains structured repository data:
```json
{
  "repository": { "name": "owner/repo", "metadata": {...} },
  "commits": [...],
  "pull_requests": [...],
  "issues": [...],
  "contributors": [...],
  "analytics": {
    "commit_frequency": {...},
    "pr_metrics": {...},
    "pr_breakdown": {
      "by_user": [...],
      "by_week": [...],
      "weekly_velocity": [...]
    }
  }
}
```

### HTML Dashboard
Self-contained HTML file with:
- Embedded CSS and JavaScript (Chart.js)
- Interactive charts and visualizations
- Responsive design for all screen sizes
- Offline functionality

## Development

### Build and Test
```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

### Project Structure
```
src/
├── cli.ts              # Command-line interface
├── types/index.ts      # TypeScript type definitions
├── collectors/         # Data collection modules
│   ├── index.ts        # Main collector orchestrator
│   ├── commits.ts      # Commit data collection
│   ├── pull-requests.ts # PR and review data collection
│   └── issues.ts       # Issue data collection
├── generators/         # HTML dashboard generation
│   ├── index.ts        # Generator orchestrator
│   └── html-generator.ts # HTML template and charts
└── utils/
    └── analytics.ts    # Data analysis and metrics
```

## Limitations

- **GitHub API Rate Limits**: 5,000 requests/hour for authenticated users
- **Review Data**: Limited to PRs within specified time range to avoid excessive API calls
- **Large Repositories**: Very large repos may take longer to analyze
- **Private Repositories**: Requires appropriate token permissions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Common Issues

**"GitHub token required" error:**
- Set `GITHUB_TOKEN` environment variable or use `--token` option

**"Resource not accessible" error:**
- Token lacks required permissions for private repositories
- Add `repo` scope to your personal access token

**Charts not displaying:**
- Check browser console for JavaScript errors
- Ensure generated HTML file is complete

**Slow data collection:**
- Use more recent date ranges with `--since`
- Exclude issues if not needed: `--include commits,prs`
- Use `--verbose` to monitor progress

### Performance Tips

- Use `--since` to limit time range for faster collection
- Cache JSON data with `--keep-json` for multiple report generations
- Use `--include` to collect only needed data types
- For large repos, start with recent data (e.g., `--since 2024-06-01`)