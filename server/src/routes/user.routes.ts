import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Get all users (Admin/Manager only)
router.get('/', authenticate, authorize('ADMIN', 'MANAGER', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        category: true,
        title: true,
        yearsOfExperience: true,
        productsSold: true,
        languages: true,
        micrositeEnabled: true,
        avatar: true,
        phone: true,
        bio: true,
        socialLinks: true,
        license_state: true,
        license_states: true,
        contractLevel: true,
        deletedAt: true,
        calendarUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        category: true,
        title: true,
        yearsOfExperience: true,
        productsSold: true,
        languages: true,
        micrositeEnabled: true,
        avatar: true,
        phone: true,
        bio: true,
        socialLinks: true,
        license_state: true,
        license_states: true,
        contractLevel: true,
        deletedAt: true,
        calendarUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const { email, password, name, role, category, ...otherData } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'ADVISOR',
        category: category || 'INSURANCE',
        productsSold: otherData.productsSold || [],
        languages: otherData.languages || [],
        license_states: otherData.license_states || [],
        ...otherData
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        category: true,
        title: true,
        yearsOfExperience: true,
        productsSold: true,
        languages: true,
        micrositeEnabled: true,
        avatar: true,
        phone: true,
        bio: true,
        socialLinks: true,
        license_state: true,
        license_states: true,
        contractLevel: true,
        calendarUrl: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Users can update themselves, Admin can update anyone
    if (req.userId !== id && req.userRole !== 'ADMIN' && req.userRole !== 'SUB_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        category: true,
        title: true,
        yearsOfExperience: true,
        productsSold: true,
        languages: true,
        micrositeEnabled: true,
        avatar: true,
        phone: true,
        bio: true,
        socialLinks: true,
        license_state: true,
        license_states: true,
        contractLevel: true,
        deletedAt: true,
        calendarUrl: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Soft delete user (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'User archived successfully', user });
  } catch (error) {
    next(error);
  }
});

// Restore user (Admin only)
router.post('/:id/restore', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: null }
    });

    res.json({ message: 'User restored successfully', user });
  } catch (error) {
    next(error);
  }
});

// Permanent delete (Admin only)
router.delete('/:id/permanent', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User permanently deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
