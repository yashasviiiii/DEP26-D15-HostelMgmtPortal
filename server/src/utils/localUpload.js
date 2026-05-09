// utils/localUpload.js
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const processAndSaveFile = async (file, folderName) => {
  if (!file) return null;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  
  // Handle PDF (Don't process with Sharp)
  if (file.mimetype === 'application/pdf') {
    const pdfName = `${fileName}.pdf`;
    const filePath = path.join(uploadDir, pdfName);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${folderName}/${pdfName}`;
  }

  // Handle Images (Process with Sharp)
  const imgName = `${fileName}.webp`;
  const filePath = path.join(uploadDir, imgName);

  await sharp(file.buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, effort:6})
    .toFile(filePath);

  return `/uploads/${folderName}/${imgName}`;
};

export const processAndSaveFiles = async (files, folderName) => {
  if (!files || files.length === 0) return [];
  
  // Use Promise.all to process all files in parallel
  return await Promise.all(
    files.map(file => processAndSaveFile(file, folderName))
  );
};