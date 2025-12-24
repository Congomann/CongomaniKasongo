import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        advisor: { select: { id: true, name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        ...req.body,
        advisorId: req.body.advisorId || req.userId!,
        status: 'pending'
      }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/approve', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { status: 'approved' }
    });
    res.json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/submit-edit', authenticate, async (req, res, next) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: {
        status: 'pending_edit',
        editedClientName: req.body.editedClientName,
        editedRating: req.body.editedRating,
        editedReviewText: req.body.editedReviewText
      }
    });
    res.json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/approve-edit', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const current = await prisma.testimonial.findUnique({
      where: { id: req.params.id }
    });

    if (!current) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: {
        clientName: current.editedClientName || current.clientName,
        rating: current.editedRating || current.rating,
        reviewText: current.editedReviewText || current.reviewText,
        status: 'approved',
        editedClientName: null,
        editedRating: null,
        editedReviewText: null
      }
    });
    res.json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    await prisma.testimonial.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
