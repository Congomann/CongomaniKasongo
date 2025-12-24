import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    let settings = await prisma.companySettings.findFirst();
    
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          phone: '(800) 555-0199',
          email: 'contact@newholland.com',
          address: '123 Finance Way',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          heroBackgroundType: 'image',
          heroBackgroundUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
          heroVideoPlaylist: [],
          archivedVideos: [],
          hiddenProducts: []
        }
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), async (req, res, next) => {
  try {
    const current = await prisma.companySettings.findFirst();
    
    const settings = await prisma.companySettings.update({
      where: { id: current!.id },
      data: req.body
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;
