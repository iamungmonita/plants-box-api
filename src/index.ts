// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import express, { Application } from 'express';
import fs, { fstat } from 'fs';
import path from 'path';

// import { Role } from './models/system';

// dotenv.config();

// const app: Application = express();

// app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:3001',
//       'http://192.168.1.101:3000',
//       'http://192.168.1.101:3001',
//       'http://172.21.7.41:3000',
//       'http://172.21.7.41:3001',
//     ],
//     methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
//     allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
//     credentials: true,
//   }),
// );
// app.use(routes);

// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// async function createIndexes() {
//   try {
//     await Role.init(); // Ensures indexes are created
//   } catch (error) {
//     console.error('Error creating indexes:', error);
//   }
// }
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     createIndexes();
//   })
//   .catch((err) => console.error('Connection error', err));

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

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, (): void => {
//   console.log(`Server is running on port ${PORT}`);
// });
