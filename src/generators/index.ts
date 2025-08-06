import { RepositoryData, GenerateOptions } from '../types/index';
import { generateHTML } from './html-generator';

export async function generateReport(data: RepositoryData, options: GenerateOptions = {}): Promise<string> {
  const template = options.template || 'standard';
  const theme = options.theme || 'light';
  const title = options.title || `${data.repository.name} Activity Dashboard`;

  switch (template) {
    case 'standard':
    case 'minimal':
    case 'detailed':
      return generateHTML(data, { ...options, title, theme });
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}