import { RepositoryData, GenerateOptions } from '../types/index';

export function generateHTML(data: RepositoryData, options: GenerateOptions & { title: string; theme: string }): string {
  const { title, theme } = options;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${getCSS(theme)}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${title}</h1>
            <div class="repo-info">
                <h2>${data.repository.name}</h2>
                <p>${data.repository.metadata.description || 'No description available'}</p>
                <div class="stats">
                    <span class="stat">⭐ ${data.repository.metadata.stars}</span>
                    <span class="stat">🍴 ${data.repository.metadata.forks}</span>
                    <span class="stat">💬 ${data.repository.metadata.languages.join(', ') || 'No languages detected'}</span>
                </div>
            </div>
        </header>

        <div class="summary-cards">
            <div class="card">
                <h3>📝 Commits</h3>
                <div class="metric">${data.commits.length}</div>
                <div class="period">in selected period</div>
            </div>
            <div class="card">
                <h3>🔀 Pull Requests</h3>
                <div class="metric">${data.pull_requests.length}</div>
                <div class="sub-metrics">
                    <span class="merged">${data.analytics.pr_metrics.merged} merged</span>
                    <span class="open">${data.analytics.pr_metrics.open} open</span>
                </div>
            </div>
            <div class="card">
                <h3>🐛 Issues</h3>
                <div class="metric">${data.issues.length}</div>
                <div class="sub-metrics">
                    <span class="closed">${data.analytics.issue_metrics.closed} closed</span>
                    <span class="open">${data.analytics.issue_metrics.open} open</span>
                </div>
            </div>
            <div class="card">
                <h3>👥 Contributors</h3>
                <div class="metric">${data.contributors.length}</div>
                <div class="sub-metrics">
                    <span class="active">${data.analytics.contributor_patterns.active_contributors.length} active</span>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-container">
                <h3>Commit Activity Over Time</h3>
                <canvas id="commitChart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>Pull Request Status</h3>
                <canvas id="prChart"></canvas>
            </div>

            <div class="chart-container">
                <h3>Top Contributors</h3>
                <canvas id="contributorChart"></canvas>
            </div>

            <div class="chart-container">
                <h3>Issue Resolution</h3>
                <canvas id="issueChart"></canvas>
            </div>
        </div>

        <div class="data-tables">
            <div class="table-container">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    ${generateRecentActivity(data)}
                </div>
            </div>
        </div>

        <footer class="footer">
            <p>Generated on ${new Date(data.repository.collection_date).toLocaleString()}</p>
            <p>Data period: ${new Date(data.repository.time_range.start).toLocaleDateString()} - ${new Date(data.repository.time_range.end).toLocaleDateString()}</p>
        </footer>
    </div>

    <script>
        ${generateChartScript(data)}
    </script>
</body>
</html>`;
}

function getCSS(theme: string): string {
  const isDark = theme === 'dark';
  
  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: ${isDark ? '#e0e6ed' : '#333'};
            background: ${isDark ? '#0d1117' : '#f8f9fa'};
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: ${isDark ? '#161b22' : '#ffffff'};
            border-radius: 12px;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: ${isDark ? '#58a6ff' : '#0366d6'};
        }

        .repo-info h2 {
            font-size: 1.8em;
            margin-bottom: 10px;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }

        .repo-info p {
            font-size: 1.1em;
            color: ${isDark ? '#8b949e' : '#586069'};
            margin-bottom: 20px;
        }

        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }

        .stat {
            font-size: 1.1em;
            color: ${isDark ? '#8b949e' : '#586069'};
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .card {
            background: ${isDark ? '#161b22' : '#ffffff'};
            padding: 30px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
            text-align: center;
            border: 1px solid ${isDark ? '#21262d' : '#e1e4e8'};
        }

        .card h3 {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }

        .metric {
            font-size: 3em;
            font-weight: bold;
            color: ${isDark ? '#58a6ff' : '#0366d6'};
            margin-bottom: 10px;
        }

        .period, .sub-metrics {
            color: ${isDark ? '#8b949e' : '#586069'};
            font-size: 0.9em;
        }

        .sub-metrics {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .merged { color: #28a745; }
        .closed { color: #6f42c1; }
        .open { color: #fd7e14; }
        .active { color: #17a2b8; }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .chart-container {
            background: ${isDark ? '#161b22' : '#ffffff'};
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
            border: 1px solid ${isDark ? '#21262d' : '#e1e4e8'};
        }

        .chart-container h3 {
            margin-bottom: 20px;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }

        .chart-container canvas {
            max-height: 300px;
        }

        .data-tables {
            margin-bottom: 40px;
        }

        .table-container {
            background: ${isDark ? '#161b22' : '#ffffff'};
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
            border: 1px solid ${isDark ? '#21262d' : '#e1e4e8'};
        }

        .table-container h3 {
            margin-bottom: 20px;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }

        .activity-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .activity-item {
            padding: 15px;
            border-bottom: 1px solid ${isDark ? '#21262d' : '#e1e4e8'};
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 600;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            margin-bottom: 5px;
        }

        .activity-meta {
            color: ${isDark ? '#8b949e' : '#586069'};
            font-size: 0.9em;
        }

        .footer {
            text-align: center;
            padding: 30px 0;
            color: ${isDark ? '#8b949e' : '#586069'};
            border-top: 1px solid ${isDark ? '#21262d' : '#e1e4e8'};
            margin-top: 40px;
        }

        @media (max-width: 768px) {
            .summary-cards {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .stats {
                flex-direction: column;
                gap: 15px;
            }
        }
    `;
}

function generateRecentActivity(data: RepositoryData): string {
  const activities: Array<{ type: string; title: string; author: string; date: string; url?: string }> = [];

  // Add recent commits
  data.commits.slice(-10).forEach(commit => {
    activities.push({
      type: 'commit',
      title: commit.message.split('\n')[0].slice(0, 100),
      author: commit.author,
      date: commit.date
    });
  });

  // Add recent PRs
  data.pull_requests.slice(-10).forEach(pr => {
    activities.push({
      type: 'pr',
      title: pr.title,
      author: pr.author,
      date: pr.created_at
    });
  });

  // Add recent issues
  data.issues.slice(-10).forEach(issue => {
    activities.push({
      type: 'issue',
      title: issue.title,
      author: issue.author,
      date: issue.created_at
    });
  });

  // Sort by date and take recent 20
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return activities.slice(0, 20).map(activity => {
    const icon = activity.type === 'commit' ? '📝' : activity.type === 'pr' ? '🔀' : '🐛';
    const date = new Date(activity.date).toLocaleDateString();
    
    return `
        <div class="activity-item">
            <div class="activity-content">
                <div class="activity-title">${icon} ${activity.title}</div>
                <div class="activity-meta">by ${activity.author} on ${date}</div>
            </div>
        </div>
    `;
  }).join('');
}

function generateChartScript(data: RepositoryData): string {
  return `
        Chart.defaults.color = document.body.style.color;
        Chart.defaults.borderColor = 'rgba(128, 128, 128, 0.2)';
        Chart.defaults.backgroundColor = 'rgba(128, 128, 128, 0.1)';

        // Commit Activity Chart
        const commitCtx = document.getElementById('commitChart');
        if (commitCtx) {
            const commitData = ${JSON.stringify(data.analytics.commit_frequency.daily)};
            new Chart(commitCtx, {
                type: 'line',
                data: {
                    labels: commitData.map(d => new Date(d.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Commits',
                        data: commitData.map(d => d.count),
                        borderColor: '#58a6ff',
                        backgroundColor: 'rgba(88, 166, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // Pull Request Chart
        const prCtx = document.getElementById('prChart');
        if (prCtx) {
            new Chart(prCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Merged', 'Open', 'Closed'],
                    datasets: [{
                        data: [
                            ${data.analytics.pr_metrics.merged},
                            ${data.analytics.pr_metrics.open},
                            ${data.analytics.pr_metrics.closed}
                        ],
                        backgroundColor: ['#28a745', '#fd7e14', '#6f42c1']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Contributors Chart
        const contributorCtx = document.getElementById('contributorChart');
        if (contributorCtx) {
            const topContributors = ${JSON.stringify(data.analytics.contributor_patterns.top_contributors.slice(0, 8))};
            new Chart(contributorCtx, {
                type: 'bar',
                data: {
                    labels: topContributors.map(c => c.login),
                    datasets: [{
                        label: 'Contributions',
                        data: topContributors.map(c => c.commits),
                        backgroundColor: '#58a6ff',
                        borderColor: '#1f6feb',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // Issues Chart
        const issueCtx = document.getElementById('issueChart');
        if (issueCtx) {
            new Chart(issueCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Open', 'Closed'],
                    datasets: [{
                        data: [
                            ${data.analytics.issue_metrics.open},
                            ${data.analytics.issue_metrics.closed}
                        ],
                        backgroundColor: ['#fd7e14', '#6f42c1']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    `;
}