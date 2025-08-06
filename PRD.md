# GitHub Repository Activity Analyzer - Product Requirements Document

## Product Overview

A TypeScript/Node.js command-line tool that uses Octokit.js to fetch repository data from GitHub's API and generate interactive, standalone HTML dashboards for visualizing and understanding repository activity patterns.

## Core Value Proposition

Transform raw GitHub repository data into actionable insights through interactive visualizations, helping teams understand project health, contributor patterns, and development trends without requiring complex analytics platforms.

## Target Users

- **Development Team Leads**: Understanding team productivity and contribution patterns
- **Project Managers**: Tracking project health and milestone progress
- **Open Source Maintainers**: Analyzing community engagement and project growth
- **Engineering Managers**: Making data-driven decisions about resource allocation

## Core Features

### 1. Data Collection Engine

**Repository Metrics:**
- Commit history and frequency analysis
- Pull request lifecycle tracking (creation, review, merge times)
- Issue management patterns (open/close rates, resolution times)
- Branch activity and merge patterns
- Release and deployment history
- Code review participation rates

**Contributor Analysis:**
- Individual activity levels and patterns
- Code ownership distribution
- Collaboration network analysis
- New vs. returning contributor identification
- Time-based activity patterns (daily/weekly/monthly)

### 2. Interactive Dashboard Generation

**Timeline Visualizations:**
- Commit activity heatmaps with customizable time ranges
- Pull request flow diagrams with status tracking
- Issue lifecycle visualization with label-based filtering
- Release timeline with impact analysis

**Contributor Insights:**
- Activity distribution charts across team members
- Code ownership maps by file/directory
- Collaboration network graphs
- Productivity trend analysis

**Repository Health Metrics:**
- Response time analytics for issues/PRs
- Code review coverage and quality indicators
- Branch health and merge conflict analysis
- Technical debt indicators (if determinable from metadata)

### 3. Technical Capabilities

**CLI Interface:**
- Simple command structure: `repo-activity analyze [repo] [options]`
- Support for both public and private repositories via GitHub token authentication
- Configurable time ranges (last week, month, quarter, year, custom)
- Output format options (HTML dashboard, JSON data export)
- TypeScript-based CLI with comprehensive error handling

**Performance & Reliability:**
- Efficient GitHub API usage leveraging Octokit's built-in optimizations
- Progress indicators for long-running data collection with TypeScript async/await patterns
- File-system based caching mechanism for repeated analysis
- Graceful error handling with typed exceptions and recovery strategies

**Output Quality:**
- Self-contained HTML files with embedded assets
- Responsive design for desktop and mobile viewing
- Print-friendly layouts for reporting
- Customizable themes and branding options

## User Stories

### Team Lead Persona
- "As a team lead, I want to see which contributors are most active so I can balance workload distribution"
- "I need to understand our code review patterns to improve our development process"
- "I want to identify bottlenecks in our PR approval process"

### Project Manager Persona
- "As a PM, I need to track milestone progress and identify at-risk deliverables"
- "I want to understand our issue resolution patterns to set better expectations"
- "I need visual reports I can share with stakeholders about project health"

### Open Source Maintainer Persona
- "I want to see community engagement trends to understand project growth"
- "I need to identify my most valuable contributors for recognition"
- "I want to understand seasonal patterns in contributions"

## Architecture Overview

### Two-Phase Design

The tool employs a clean separation between data collection and visualization generation, enabling flexible workflows and efficient re-processing.

#### Phase 1: Data Collection
**Purpose**: Fetch and process raw GitHub data into a structured, analysis-ready format

**Input**: Repository identifier, time range, configuration options
**Output**: Structured JSON file containing all necessary data for visualization

**Components**:
- **Octokit Client**: Handles GitHub authentication and executes REST/GraphQL API calls
- **Data Fetchers**: Specialized TypeScript modules for different data types (commits, PRs, issues, contributors)
- **Rate Limit Manager**: Leverages Octokit's built-in throttling and implements intelligent batching
- **Data Processor**: Normalizes, enriches, and aggregates raw API responses with type safety
- **Cache Manager**: Stores intermediate results to avoid re-fetching unchanged data

**Key Operations**:
1. Repository metadata collection (name, description, languages, etc.)
2. Commit history analysis with file change tracking
3. Pull request lifecycle data (creation, reviews, merges, closures)
4. Issue management patterns (labels, milestones, assignees, state changes)
5. Contributor identification and activity aggregation
6. Branch and release timeline construction

**Output Schema Example**:
```json
{
  "repository": {
    "name": "owner/repo",
    "metadata": { "description": "...", "languages": [...], "created_at": "..." },
    "collection_date": "2025-01-15T10:30:00Z",
    "time_range": { "start": "2024-01-01T00:00:00Z", "end": "2025-01-15T00:00:00Z" }
  },
  "commits": [
    { "sha": "abc123", "author": "user1", "date": "...", "message": "...", "files_changed": [...] }
  ],
  "pull_requests": [
    { "number": 42, "title": "...", "author": "user1", "created_at": "...", "merged_at": "...", "reviews": [...] }
  ],
  "issues": [
    { "number": 10, "title": "...", "author": "user2", "created_at": "...", "closed_at": "...", "labels": [...] }
  ],
  "contributors": [
    { "login": "user1", "name": "John Doe", "commits": 45, "prs": 12, "issues": 3 }
  ],
  "analytics": {
    "commit_frequency": { "daily": [...], "weekly": [...], "monthly": [...] },
    "pr_metrics": { "average_merge_time": "3.2 days", "review_coverage": "85%" },
    "contributor_patterns": { "top_contributors": [...], "new_contributors": [...] }
  }
}
```

#### Phase 2: Visualization Generation
**Purpose**: Transform structured data into interactive HTML dashboards

**Input**: JSON data file from Phase 1, optional template/theme configuration
**Output**: Self-contained HTML file with embedded assets

**Components**:
- **Template Engine**: Processes HTML templates with data binding
- **Chart Generator**: Creates interactive visualizations using chosen JS libraries
- **Asset Bundler**: Embeds CSS, JavaScript, and other assets into single HTML file
- **Theme Manager**: Applies consistent styling and supports customization

**Key Operations**:
1. Data validation and preprocessing for visualization libraries
2. Chart configuration and generation (timelines, heatmaps, bar charts, networks)
3. HTML template rendering with dynamic content injection
4. CSS/JS asset bundling for offline functionality
5. Responsive layout generation for multiple screen sizes

### CLI Interface Design

```bash
# Phase 1: Data Collection
repo-activity collect [owner/repo] [options]
  --since=DATE          # Start date for data collection (default: 1 year ago)
  --until=DATE          # End date for data collection (default: now)
  --output=FILE         # JSON output file path (default: ./repo-data.json)
  --cache-dir=PATH      # Cache directory for API responses
  --include=TYPES       # Comma-separated list: commits,prs,issues,releases
  --token=TOKEN         # GitHub personal access token (or use GITHUB_TOKEN env var)
  --verbose             # Show detailed progress information

# Phase 2: Visualization Generation
repo-activity generate [data-file] [options]
  --template=NAME       # Built-in template: standard,minimal,detailed
  --theme=NAME          # Color scheme: light,dark,corporate
  --output=FILE         # HTML output file path (default: ./dashboard.html)
  --title=TEXT          # Custom dashboard title
  --embed-fonts         # Include web fonts for offline use

# Combined workflow (most common usage)
repo-activity analyze [owner/repo] [options]
  # Equivalent to: collect + generate with smart defaults
  --since=DATE
  --until=DATE
  --output=FILE         # HTML output (JSON intermediate file auto-managed)
  --template=NAME
  --theme=NAME
  --token=TOKEN         # GitHub personal access token
  --keep-json           # Preserve intermediate JSON file
```

### Data Flow Architecture

```
[GitHub API] 
    ↓ (REST/GraphQL via Octokit)
[TypeScript Data Fetchers] 
    ↓ (typed responses)
[Data Processor] 
    ↓ (normalized, type-safe data)
[JSON Output] ──→ [File System Cache]
    ↓ (structured data)
[Template Engine]
    ↓ (data binding)
[Chart Generator]
    ↓ (visualization configs)
[Asset Bundler]
    ↓ (embedded resources)
[HTML Dashboard]
```

### Benefits of Two-Phase Architecture

1. **Flexibility**: Users can re-generate visualizations without re-fetching data
2. **Performance**: Data collection can be cached and reused across different report types
3. **Debugging**: JSON intermediate files enable inspection and troubleshooting
4. **Extensibility**: New visualization types can be added without changing data collection
5. **Collaboration**: JSON files can be shared between team members for consistent reporting
6. **Automation**: Phase 1 can run on schedule (CI/CD) with Phase 2 triggered as needed

## Technical Requirements

### Dependencies
- Node.js (v18+) runtime environment
- TypeScript for development and type safety
- Octokit.js for GitHub API interactions
- Modern web browser for viewing generated reports

### GitHub API Integration
- **Octokit.js SDK**: Comprehensive GitHub API client with TypeScript support
- **Authentication**: Personal access tokens via CLI option or GITHUB_TOKEN environment variable
- **API Usage**: Combined REST and GraphQL API calls for optimal data fetching
- **Rate Limiting**: Leverage Octokit's built-in throttling and retry mechanisms
- **Enterprise Support**: Compatible with GitHub Enterprise Server instances
- **Error Handling**: Robust error handling with Octokit's RequestError types

### TypeScript Architecture Benefits
- **Type Safety**: Compile-time validation of API responses and data structures
- **IntelliSense**: Enhanced developer experience with autocomplete and documentation
- **Refactoring**: Safe code changes with compile-time verification
- **Maintainability**: Clear interfaces and contracts between components

### Output Specifications
- Generate self-contained HTML files with embedded CSS/JS
- Include JSON data export option for programmatic access
- Support for multiple visualization libraries (Chart.js, D3.js, etc.)
- Responsive design with mobile optimization

## Success Metrics

### Usage Metrics
- Number of repositories analyzed per month
- User retention (repeat usage within 30 days)
- Average session duration with generated reports

### Quality Metrics
- Time to generate report (target: <2 minutes for typical repo)
- User satisfaction with visualization clarity
- Accuracy of insights compared to manual analysis

## Future Enhancements (V2+)

- **Team Comparison**: Cross-repository analysis for organizations
- **Predictive Analytics**: Trend forecasting and anomaly detection
- **Integration Capabilities**: Webhook support for continuous monitoring
- **Advanced Filtering**: Custom query builders for specific analysis needs
- **Collaboration Features**: Shared dashboards with commenting/annotation
- **Export Options**: PDF reports, CSV data exports, API endpoints

## Non-Goals (Explicitly Out of Scope)

- Real-time monitoring (this is a point-in-time analysis tool)
- Code quality analysis (focus is on activity patterns, not code metrics)
- Direct GitHub integration (remains a standalone analysis tool)
- User authentication beyond GitHub CLI session
- Data storage or historical trending across multiple runs

## Open Questions

1. Should the tool focus on a specific visualization library or remain library-agnostic?
2. What level of customization should be provided for report layouts?
3. How should we handle very large repositories with extensive history?
4. Should there be built-in report templates for common use cases?
5. What's the preferred approach for handling private repository data privacy?

## Implementation Considerations

### Technology Stack
- **Runtime**: Node.js v18+ for modern JavaScript features and stability
- **Language**: TypeScript for type safety and enhanced developer experience
- **GitHub API**: Octokit.js for comprehensive GitHub API access with built-in optimizations
- **CLI Framework**: Consider Commander.js or similar for robust argument parsing
- **Bundling**: Webpack or esbuild for efficient asset bundling in visualization phase
- **Testing**: Jest with TypeScript support for unit and integration testing

### Development Approach
- Start with MVP focusing on commit and PR analysis
- Implement comprehensive TypeScript interfaces for all data structures
- Leverage Octokit's pagination and rate limiting features from day one
- Build modular architecture to support plugin extensions
- Prioritize error handling with typed exceptions
- Ensure generated reports work offline with embedded assets

### Package Distribution
- Publish as npm package for easy installation (`npm install -g repo-activity`)
- Include TypeScript declaration files for programmatic usage
- Provide pre-compiled binaries for systems without Node.js