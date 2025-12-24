import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { dateAdded: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const resource = await prisma.resource.create({
      data: {
        ...req.body,
        comments: req.body.comments || [],
        tags: req.body.tags || []
      }
    });
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } }
    });
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/dislike', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { dislikes: { increment: 1 } }
    });
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { shares: { increment: 1 } }
    });
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comment', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const comments = resource.comments as any[];
    comments.push({
      id: Math.random().toString(36).substr(2, 9),
      user: req.body.user,
      avatar: req.body.avatar,
      text: req.body.text,
      date: new Date().toISOString()
    });

    const updated = await prisma.resource.update({
      where: { id: req.params.id },
      data: { comments }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    await prisma.resource.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
