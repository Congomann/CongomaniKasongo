import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Properties
router.get('/listings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const properties = await prisma.propertyListing.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { listedDate: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    next(error);
  }
});

router.post('/listings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const property = await prisma.propertyListing.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!
      }
    });
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
});

router.put('/listings/:id', authenticate, async (req, res, next) => {
  try {
    const property = await prisma.propertyListing.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(property);
  } catch (error) {
    next(error);
  }
});

// Transactions
router.get('/transactions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const transactions = await prisma.escrowTransaction.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/transactions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const transaction = await prisma.escrowTransaction.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!,
        closingDate: new Date(req.body.closingDate)
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

router.put('/transactions/:id', authenticate, async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };
    if (updateData.closingDate) {
      updateData.closingDate = new Date(updateData.closingDate);
    }

    const transaction = await prisma.escrowTransaction.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;
