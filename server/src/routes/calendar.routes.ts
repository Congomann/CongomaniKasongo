import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const event = await prisma.calendarEvent.create({
      data: {
        ...req.body,
        userId: req.userId,
        date: new Date(req.body.date)
      }
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      }
    });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.calendarEvent.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
