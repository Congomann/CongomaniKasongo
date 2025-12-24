import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        advisor: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json(commissions);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const commission = await prisma.commission.create({
      data: req.body
    });
    res.status(201).json(commission);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const commission = await prisma.commission.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(commission);
  } catch (error) {
    next(error);
  }
});

export default router;
