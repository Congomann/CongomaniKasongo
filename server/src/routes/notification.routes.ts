import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

router.delete('/clear', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.userId!, read: true }
    });
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    next(error);
  }
});

export default router;
