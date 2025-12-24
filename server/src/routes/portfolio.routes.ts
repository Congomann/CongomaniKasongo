import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Portfolios
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const portfolios = await prisma.clientPortfolio.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(portfolios);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const portfolio = await prisma.clientPortfolio.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!,
        lastRebalanced: new Date(req.body.lastRebalanced || Date.now()),
        holdings: req.body.holdings || []
      }
    });
    res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };
    if (updateData.lastRebalanced) {
      updateData.lastRebalanced = new Date(updateData.lastRebalanced);
    }

    const portfolio = await prisma.clientPortfolio.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Compliance Docs
router.get('/compliance', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const docs = await prisma.complianceDocument.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { uploadDate: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

router.post('/compliance', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const doc = await prisma.complianceDocument.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!
      }
    });
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
});

// Advisory Fees
router.get('/fees', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.advisorId = req.userId;
    }

    const fees = await prisma.advisoryFee.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { dueDate: 'desc' }
    });
    res.json(fees);
  } catch (error) {
    next(error);
  }
});

router.post('/fees', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const fee = await prisma.advisoryFee.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!,
        dueDate: new Date(req.body.dueDate)
      }
    });
    res.status(201).json(fee);
  } catch (error) {
    next(error);
  }
});

router.put('/fees/:id', authenticate, async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const fee = await prisma.advisoryFee.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(fee);
  } catch (error) {
    next(error);
  }
});

export default router;
