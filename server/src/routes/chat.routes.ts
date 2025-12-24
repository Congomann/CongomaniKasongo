import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: req.userId! },
          { receiverId: req.userId! }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        ...req.body,
        senderId: req.userId!,
        timestamp: new Date()
      }
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const message = await prisma.chatMessage.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

export default router;
