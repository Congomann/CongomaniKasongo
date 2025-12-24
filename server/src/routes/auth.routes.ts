import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role = 'ADVISOR', category = 'INSURANCE' } = req.body;

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
        role,
        category,
        productsSold: [],
        languages: [],
        license_states: []
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        category: user.category
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is soft-deleted
    if (user.deletedAt) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        category: user.category,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        title: user.title,
        yearsOfExperience: user.yearsOfExperience,
        productsSold: user.productsSold,
        languages: user.languages,
        micrositeEnabled: user.micrositeEnabled,
        socialLinks: user.socialLinks,
        license_state: user.license_state,
        license_states: user.license_states,
        contractLevel: user.contractLevel,
        calendarUrl: user.calendarUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
