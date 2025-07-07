import { Router, Request } from "express";
import multer from "multer";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  create,
  listMine,
  listPublic,
  get,
  close,
  vote,
} from "../controllers/pollController";

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (/(.png|.jpg|.jpeg)$/i.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos .png, .jpg, .jpeg são permitidos!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.get("/", listPublic);
router.get("/mine", authenticateToken, listMine);
router.get("/:id", authenticateToken, get);
router.post("/", authenticateToken, upload.single("image"), create);
router.post("/:id/close", authenticateToken, close);
router.post("/:id/vote", authenticateToken, vote);

export default router;
