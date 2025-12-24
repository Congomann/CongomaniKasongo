import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const application = await prisma.jobApplication.create({
      data: req.body
    });
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const application = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(application);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.jobApplication.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
