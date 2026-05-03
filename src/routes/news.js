import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getNews,
  searchArticles,
  getArticle,
  markArticleRead,
  getReadList,
} from '../controllers/newsController.js';

const router = Router();

/* ---- All news routes require authentication ---- */
router.use(authMiddleware);

/* ---- Routes ---- */

// IMPORTANT: static routes must be defined before parameterized routes
// so that "/read" is not interpreted as "/:id" with id="read"

router.get('/read', getReadList);              // GET  /api/news/read
router.get('/search/:keyword', searchArticles); // GET  /api/news/search/:keyword
router.get('/:id', getArticle);                // GET  /api/news/:id
router.post('/:id/read', markArticleRead);     // POST /api/news/:id/read
router.get('/', getNews);                      // GET  /api/news

export default router;
