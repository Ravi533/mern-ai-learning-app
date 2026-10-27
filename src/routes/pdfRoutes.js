
import express from "express";
import multer from "multer";
import { uploadPdf } from "../controllers/pdfController.js";
import { askPdfQuestion } from "../controllers/pdfQuestionController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload", upload.single("pdf"), uploadPdf);
router.post("/ask", askPdfQuestion);

export default router;
