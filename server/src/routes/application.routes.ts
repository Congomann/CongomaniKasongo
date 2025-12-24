import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        lead: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const application = await prisma.application.create({
      data: req.body
    });
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(application);
  } catch (error) {
    next(error);
  }
});

export default router;
