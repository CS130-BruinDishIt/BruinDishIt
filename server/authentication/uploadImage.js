import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, // like a username for R2
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, // like a password for R2
  },
});


export const uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided." });
      }
  
      // Generate a unique filename using UUID and preserve the original file extension
      const ext = req.file.originalname.split(".").pop();
      const key = `ProfilePics/${crypto.randomUUID()}.${ext}`;
  
      // Upload file to R2
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
  
      // Build the public URL to access the uploaded image
      const url = `${process.env.R2_PUBLIC_URL}/${key}`;
      return res.json({ url });
  
    } catch (error) {
      return next(error);
    }
};
