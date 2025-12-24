import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const carriers = await prisma.carrier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(carriers);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const carrier = await prisma.carrier.create({
      data: req.body
    });
    res.status(201).json(carrier);
  } catch (error) {
    next(error);
  }
});

router.post('/assign', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const { advisorIds, carrierIds } = req.body;
    
    const assignments = [];
    for (const advisorId of advisorIds) {
      for (const carrierId of carrierIds) {
        const carrier = await prisma.carrier.findUnique({ where: { id: carrierId } });
        if (carrier) {
          const assignment = await prisma.advisorAssignment.upsert({
            where: {
              advisorId_carrierId: {
                advisorId,
                carrierId
              }
            },
            update: {},
            create: {
              advisorId,
              carrierId,
              carrierName: carrier.name,
              category: carrier.category,
              assignedBy: req.body.assignedBy || 'Admin'
            }
          });
          assignments.push(assignment);
        }
      }
    }

    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.get('/assignments/:advisorId', authenticate, async (req, res, next) => {
  try {
    const assignments = await prisma.advisorAssignment.findMany({
      where: { advisorId: req.params.advisorId },
      include: {
        carrier: true
      }
    });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

export default router;
