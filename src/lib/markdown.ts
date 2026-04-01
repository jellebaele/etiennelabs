import fs from 'fs';
import path from 'path';

export function getContentByName(fileName: string): string {
  try {
    const filePath = path.join(process.cwd(), 'content', `${fileName}.md`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading markdown file: ${fileName}`, error);
    return ''; // Return empty string or a custom error message
  }
}
