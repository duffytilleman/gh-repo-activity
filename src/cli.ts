#!/usr/bin/env node

import { Command } from 'commander';
import { collectData } from './collectors/index.js';
import { generateReport } from './generators/index.js';
import { CollectOptions, GenerateOptions } from './types/index.js';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('repo-activity')
  .description('GitHub repository activity analyzer and dashboard generator')
  .version('0.1.0');

program
  .command('collect')
  .description('Collect repository data from GitHub API')
  .argument('<repo>', 'Repository in format owner/repo')
  .option('--since <date>', 'Start date for data collection (ISO format)', getDefaultSince())
  .option('--until <date>', 'End date for data collection (ISO format)', new Date().toISOString())
  .option('--output <file>', 'JSON output file path', './repo-data.json')
  .option('--token <token>', 'GitHub personal access token')
  .option('--verbose', 'Show detailed progress information', false)
  .option('--include <types>', 'Comma-separated list: commits,prs,issues', 'commits,prs,issues')
  .action(async (repo: string, options: CollectOptions) => {
    try {
      console.log(`🔍 Collecting data for ${repo}...`);
      
      const token = options.token || process.env.GITHUB_TOKEN;
      if (!token) {
        console.error('❌ GitHub token required. Use --token option or set GITHUB_TOKEN environment variable.');
        process.exit(1);
      }

      const data = await collectData(repo, {
        ...options,
        token,
        include: options.include ? options.include.split(',') : ['commits', 'prs', 'issues']
      });

      const outputPath = path.resolve(options.output || './repo-data.json');
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ Data collected and saved to ${outputPath}`);
      console.log(`📊 Found: ${data.commits.length} commits, ${data.pull_requests.length} PRs, ${data.issues.length} issues`);
    } catch (error) {
      console.error('❌ Error collecting data:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate HTML dashboard from collected data')
  .argument('<data-file>', 'Path to JSON data file')
  .option('--template <name>', 'Template name (standard, minimal, detailed)', 'standard')
  .option('--theme <name>', 'Color theme (light, dark)', 'light')
  .option('--output <file>', 'HTML output file path', './dashboard.html')
  .option('--title <text>', 'Custom dashboard title')
  .action(async (dataFile: string, options: GenerateOptions) => {
    try {
      console.log(`📊 Generating dashboard from ${dataFile}...`);

      if (!fs.existsSync(dataFile)) {
        console.error(`❌ Data file not found: ${dataFile}`);
        process.exit(1);
      }

      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      const html = await generateReport(data, options);

      const outputPath = path.resolve(options.output || './dashboard.html');
      fs.writeFileSync(outputPath, html);

      console.log(`✅ Dashboard generated: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generating dashboard:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Complete workflow: collect data and generate dashboard')
  .argument('<repo>', 'Repository in format owner/repo')
  .option('--since <date>', 'Start date for data collection', getDefaultSince())
  .option('--until <date>', 'End date for data collection', new Date().toISOString())
  .option('--output <file>', 'HTML output file path', './dashboard.html')
  .option('--template <name>', 'Template name', 'standard')
  .option('--theme <name>', 'Color theme', 'light')
  .option('--token <token>', 'GitHub personal access token')
  .option('--keep-json', 'Preserve intermediate JSON file', false)
  .option('--verbose', 'Show detailed progress information', false)
  .action(async (repo: string, options: any) => {
    try {
      console.log(`🚀 Analyzing ${repo}...`);

      const token = options.token || process.env.GITHUB_TOKEN;
      if (!token) {
        console.error('❌ GitHub token required. Use --token option or set GITHUB_TOKEN environment variable.');
        process.exit(1);
      }

      // Collect data
      console.log('🔍 Phase 1: Collecting data...');
      const data = await collectData(repo, {
        since: options.since,
        until: options.until,
        token,
        verbose: options.verbose,
        include: ['commits', 'prs', 'issues']
      });

      // Generate report
      console.log('📊 Phase 2: Generating dashboard...');
      const html = await generateReport(data, {
        template: options.template,
        theme: options.theme,
        title: options.title || `${repo} Activity Dashboard`
      });

      // Save outputs
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, html);

      if (options.keepJson) {
        const jsonPath = outputPath.replace(/\.html?$/, '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(`📄 Data saved to ${jsonPath}`);
      }

      console.log(`✅ Analysis complete: ${outputPath}`);
      console.log(`📊 Summary: ${data.commits.length} commits, ${data.pull_requests.length} PRs, ${data.issues.length} issues`);
    } catch (error) {
      console.error('❌ Error during analysis:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function getDefaultSince(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString();
}

if (require.main === module) {
  program.parse();
}

export { program };