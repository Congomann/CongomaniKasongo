import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Accounts (Chart of Accounts)
router.get('/accounts', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: [{ type: 'asc' }, { code: 'asc' }]
    });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.post('/accounts', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const account = await prisma.account.create({
      data: req.body
    });
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

router.put('/accounts/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const account = await prisma.account.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(account);
  } catch (error) {
    next(error);
  }
});

// Journal Entries
router.get('/journal', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/journal', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const { lines, ...entryData } = req.body;
    
    const entry = await prisma.journalEntry.create({
      data: {
        ...entryData,
        date: new Date(entryData.date),
        lines: {
          create: lines
        }
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });

    // Update account balances
    for (const line of lines) {
      const account = await prisma.account.findUnique({
        where: { id: line.accountId }
      });

      if (account) {
        const balanceChange = account.normalBalance === 'debit' 
          ? (line.debit - line.credit) 
          : (line.credit - line.debit);

        await prisma.account.update({
          where: { id: line.accountId },
          data: {
            balance: account.balance + balanceChange
          }
        });
      }
    }

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// Tax Config
router.get('/tax-config', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const configs = await prisma.taxConfig.findMany();
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

router.post('/tax-config', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const config = await prisma.taxConfig.create({
      data: req.body
    });
    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
});

// Expense Categories
router.get('/expense-categories', authenticate, async (req, res, next) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/expense-categories', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const category = await prisma.expenseCategory.create({
      data: {
        ...req.body,
        keywords: req.body.keywords || []
      }
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

export default router;
