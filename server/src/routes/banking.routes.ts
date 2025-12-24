import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Bank Accounts
router.get('/accounts', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Admins can see all accounts, advisors see their own
    if (req.userRole === 'ADVISOR') {
      where.userId = req.userId;
    }

    const accounts = await prisma.bankAccount.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.post('/accounts', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const account = await prisma.bankAccount.create({
      data: {
        ...req.body,
        userId: req.body.userId || req.userId!
      }
    });
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

router.put('/accounts/:id', authenticate, async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };
    if (updateData.lastSynced) {
      updateData.lastSynced = new Date(updateData.lastSynced);
    }

    const account = await prisma.bankAccount.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(account);
  } catch (error) {
    next(error);
  }
});

router.delete('/accounts/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.bankAccount.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Bank Transactions
router.get('/transactions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { accountId } = req.query;
    
    const where: any = {};
    if (accountId) {
      where.bankAccountId = accountId;
    } else if (req.userRole === 'ADVISOR') {
      // Get all accounts for this user first
      const userAccounts = await prisma.bankAccount.findMany({
        where: { userId: req.userId },
        select: { id: true }
      });
      where.bankAccountId = { in: userAccounts.map(a => a.id) };
    }

    const transactions = await prisma.bankTransaction.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            id: true,
            accountName: true,
            institutionName: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 500 // Limit for performance
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/transactions', authenticate, async (req, res, next) => {
  try {
    const transaction = await prisma.bankTransaction.create({
      data: {
        ...req.body,
        date: new Date(req.body.date)
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
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const transaction = await prisma.bankTransaction.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Reconcile transaction
router.post('/transactions/:id/reconcile', authenticate, async (req, res, next) => {
  try {
    const { category, journalEntryId } = req.body;
    
    const transaction = await prisma.bankTransaction.update({
      where: { id: req.params.id },
      data: {
        status: 'reconciled',
        category,
        journalEntryId
      }
    });
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Bank Rules
router.get('/rules', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.userRole === 'ADVISOR') {
      where.userId = req.userId;
    }

    const rules = await prisma.bankRule.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

router.post('/rules', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rule = await prisma.bankRule.create({
      data: {
        ...req.body,
        userId: req.body.userId || req.userId!,
        conditions: req.body.conditions || []
      }
    });
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

router.delete('/rules/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.bankRule.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
