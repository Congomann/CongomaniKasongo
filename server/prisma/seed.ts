import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nhfg.com' },
    update: {},
    create: {
      email: 'admin@nhfg.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      category: 'ADMIN',
      productsSold: [],
      languages: ['English'],
      license_states: []
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test advisor
  const advisor = await prisma.user.upsert({
    where: { email: 'insurance@nhfg.com' },
    update: {},
    create: {
      email: 'insurance@nhfg.com',
      password: await bcrypt.hash('advisor123', 10),
      name: 'John Advisor',
      role: 'ADVISOR',
      category: 'INSURANCE',
      productsSold: ['Life Insurance', 'Annuity'],
      languages: ['English'],
      license_states: ['IA', 'NE'],
      micrositeEnabled: true,
      phone: '(555) 111-2222',
      bio: 'Experienced in Life Insurance.',
      calendarUrl: 'https://calendly.com/john-advisor'
    }
  });

  console.log('✅ Created advisor user:', advisor.email);

  // Create company settings
  const settings = await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
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
      hiddenProducts: [],
      heroTitle: 'Securing Your Future',
      heroSubtitle: 'Comprehensive financial solutions for every stage of life.'
    }
  });

  console.log('✅ Created company settings');

  // Create sample carriers
  const carriers = await Promise.all([
    prisma.carrier.upsert({
      where: { name: 'Prudential' },
      update: {},
      create: {
        name: 'Prudential',
        category: 'LIFE INSURANCE'
      }
    }),
    prisma.carrier.upsert({
      where: { name: 'Allstate' },
      update: {},
      create: {
        name: 'Allstate',
        category: 'AUTO / COMMERCIAL'
      }
    })
  ]);

  console.log('✅ Created sample carriers');

  // Create sample lead
  const lead = await prisma.lead.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@test.com',
      phone: '555-0101',
      interest: 'Life Insurance',
      message: 'Interested in Term Life.',
      status: 'NEW',
      score: 85,
      qualification: 'Warm'
    }
  });

  console.log('✅ Created sample lead');

  // Create sample client
  const client = await prisma.client.create({
    data: {
      name: 'Charlie Day',
      policyNumber: 'POL-12345',
      premium: 1200,
      product: 'Life Insurance',
      renewalDate: new Date('2024-12-01'),
      advisorId: advisor.id
    }
  });

  console.log('✅ Created sample client');

  // Create sample resource
  const resource = await prisma.resource.create({
    data: {
      title: 'Life Insurance Guide 101',
      type: 'PDF',
      url: '#',
      likes: 12,
      dislikes: 0,
      shares: 5,
      comments: [],
      tags: ['insurance', 'guide']
    }
  });

  console.log('✅ Created sample resource');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@nhfg.com / admin123');
  console.log('Advisor: insurance@nhfg.com / advisor123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
