import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const callbacks = await prisma.callbackRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(callbacks);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const callback = await prisma.callbackRequest.create({
      data: req.body
    });
    res.status(201).json(callback);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const callback = await prisma.callbackRequest.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(callback);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.callbackRequest.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Callback deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
