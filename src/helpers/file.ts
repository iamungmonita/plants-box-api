import fs from 'fs';
import path from 'path';

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const saveBase64Image = (base64String: string, filename: string): string => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }

  const extension = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filePath = path.join(uploadDir, `${filename}.${extension}`);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}.${extension}`; // Return relative path
};