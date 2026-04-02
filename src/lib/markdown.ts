import fs from 'fs';
import path from 'path';

export type Heading = {
  text: string;
  level: number;
  id: string;
};

export function getContentByName(fileName: string): string {
  try {
    const filePath = path.join(process.cwd(), 'content', `${fileName}.md`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading markdown file: ${fileName}`, error);
    return ''; // Return empty string or a custom error message
  }
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export function getHeadings(content: string): Heading[] {
  // Regex to find lines starting with ## or ###
  const headingLines = content.split('\n').filter((line) => line.match(/^#{1,3}\s/));

  return headingLines.map((line) => {
    const text = line.replace(/^#{1,3}\s/, '');
    return {
      text,
      level: line.startsWith('###') ? 3 : line.startsWith('##') ? 2 : 1,
      id: slugify(text),
    };
  });
}
