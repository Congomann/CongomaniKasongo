import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Get all leads (with role-based filtering)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};

    // Advisors only see their assigned leads
    if (req.userRole === 'ADVISOR') {
      where.assignedTo = req.userId;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        advisor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
  } catch (error) {
    next(error);
  }
});

// Get single lead
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        advisor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check access
    if (req.userRole === 'ADVISOR' && lead.assignedTo !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Create lead
router.post('/', async (req, res, next) => {
  try {
    const lead = await prisma.lead.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        interest: req.body.interest,
        message: req.body.message || '',
        status: req.body.status || 'NEW',
        score: req.body.score || 50,
        qualification: req.body.qualification || 'Warm',
        assignedTo: req.body.assignedTo,
        priority: req.body.priority,
        notes: req.body.notes,
        source: req.body.source,
        lifeDetails: req.body.lifeDetails || null,
        realEstateDetails: req.body.realEstateDetails || null,
        securitiesDetails: req.body.securitiesDetails || null,
        customDetails: req.body.customDetails || null
      }
    });

    // Create notification if assigned
    if (req.body.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: req.body.assignedTo,
          title: 'New Lead Assigned',
          message: `You have been assigned lead: ${lead.name}`,
          type: 'info',
          resourceType: 'lead',
          relatedId: lead.id
        }
      });
    }

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

// Update lead
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Check access for advisors
    if (req.userRole === 'ADVISOR') {
      const existingLead = await prisma.lead.findUnique({ where: { id } });
      if (!existingLead || existingLead.assignedTo !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: req.body
    });

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Bulk assign leads (Admin/Manager only)
router.post('/bulk-assign', authenticate, authorize('ADMIN', 'MANAGER', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const { leadIds, advisorId, priority, notes } = req.body;

    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        assignedTo: advisorId,
        priority,
        notes,
        status: 'ASSIGNED'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: advisorId,
        title: 'Leads Assigned',
        message: `You have been assigned ${leadIds.length} new leads`,
        type: 'info',
        resourceType: 'lead'
      }
    });

    res.json({ message: 'Leads assigned successfully' });
  } catch (error) {
    next(error);
  }
});

// Advisor accept/decline lead
router.post('/:id/action', authenticate, authorize('ADVISOR'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    
    if (!lead || lead.assignedTo !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (action === 'accept') {
      await prisma.lead.update({
        where: { id },
        data: { status: 'CONTACTED' }
      });
    } else if (action === 'decline') {
      await prisma.lead.update({
        where: { id },
        data: {
          assignedTo: null,
          notes: `${lead.notes || ''}\nDeclined by advisor: ${reason}`
        }
      });
    }

    res.json({ message: 'Action completed successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    await prisma.lead.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
