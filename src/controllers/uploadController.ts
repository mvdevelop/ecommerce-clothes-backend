import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorResponse } from "../utils/errorResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "upload", "images"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes = (
    process.env.ALLOWED_MIME_TYPES || "image/jpeg,image/png,image/gif"
  ).split(",");

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse(`Invalid file type. Allowed: ${allowedMimes.join(", ")}`, 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @desc    Upload single product image
// @route   POST /api/upload
// @access  Private/Admin
export const uploadImage = [
  upload.single("product"),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "Please provide a file to upload",
      });
      return;
    }

    const host = req.get("host") || "localhost";
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        image_url: `${baseUrl}/images/${req.file.filename}`,
      },
    });
  }),
];

// @desc    Upload multiple product images
// @route   POST /api/upload/multiple
// @access  Private/Admin
export const uploadMultipleImages = [
  upload.array("products", 10),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({
        success: false,
        error: "Please provide files to upload",
      });
      return;
    }

    const host = req.get("host") || "localhost";
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const files = req.files as Express.Multer.File[];
    const images = files.map((file) => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
      image_url: `${baseUrl}/images/${file.filename}`,
    }));

    res.status(200).json({
      success: true,
      data: images,
    });
  }),
];

export default { uploadImage, uploadMultipleImages };