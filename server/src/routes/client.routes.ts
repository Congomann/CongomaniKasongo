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

    const clients = await prisma.client.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(clients);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const client = await prisma.client.create({
      data: req.body
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
