import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = [
    { nameEn: 'Technology', nameAr: 'تقنية', slug: 'technology' },
    { nameEn: 'Design', nameAr: 'تصميم', slug: 'design' },
    { nameEn: 'Marketing', nameAr: 'تسويق', slug: 'marketing' },
    { nameEn: 'Writing', nameAr: 'كتابة', slug: 'writing' },
    { nameEn: 'Business', nameAr: 'أعمال', slug: 'business' },
    { nameEn: 'Video & Audio', nameAr: 'فيديو وصوت', slug: 'video-audio' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Create skills
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const designCategory = await prisma.category.findUnique({ where: { slug: 'design' } });

  if (techCategory) {
    const techSkills = [
      { nameEn: 'JavaScript', nameAr: 'جافاسكريبت', slug: 'javascript', categoryId: techCategory.id },
      { nameEn: 'Python', nameAr: 'بايثون', slug: 'python', categoryId: techCategory.id },
      { nameEn: 'React', nameAr: 'رياكت', slug: 'react', categoryId: techCategory.id },
      { nameEn: 'Node.js', nameAr: 'نود جي إس', slug: 'nodejs', categoryId: techCategory.id },
      { nameEn: 'TypeScript', nameAr: 'تايب سكريبت', slug: 'typescript', categoryId: techCategory.id },
    ];

    for (const skill of techSkills) {
      await prisma.skill.upsert({
        where: { slug: skill.slug },
        update: {},
        create: skill,
      });
    }
    console.log(`✅ Created ${techSkills.length} tech skills`);
  }

  if (designCategory) {
    const designSkills = [
      { nameEn: 'UI/UX Design', nameAr: 'تصميم واجهات', slug: 'ui-ux-design', categoryId: designCategory.id },
      { nameEn: 'Graphic Design', nameAr: 'تصميم جرافيك', slug: 'graphic-design', categoryId: designCategory.id },
      { nameEn: 'Logo Design', nameAr: 'تصميم شعارات', slug: 'logo-design', categoryId: designCategory.id },
    ];

    for (const skill of designSkills) {
      await prisma.skill.upsert({
        where: { slug: skill.slug },
        update: {},
        create: skill,
      });
    }
    console.log(`✅ Created ${designSkills.length} design skills`);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@talentnation.sa' },
    update: {},
    create: {
      email: 'admin@talentnation.sa',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log(`✅ Created admin user: ${admin.email} (password: admin123)`);

  // Create demo talent user
  const talentPassword = await bcrypt.hash('talent123', 10);
  const talent = await prisma.user.upsert({
    where: { email: 'talent@example.com' },
    update: {},
    create: {
      email: 'talent@example.com',
      passwordHash: talentPassword,
      firstName: 'Ahmed',
      lastName: 'Mohammed',
      role: 'TALENT',
      status: 'ACTIVE',
      emailVerified: true,
      country: 'SA',
      talentProfile: {
        create: {
          title: 'Full Stack Developer',
          headline: 'Experienced developer specializing in React and Node.js',
          yearsExperience: 5,
          hourlyRate: 150,
          availability: 'FULL_TIME',
          isAvailable: true,
        },
      },
    },
  });
  console.log(`✅ Created talent user: ${talent.email} (password: talent123)`);

  // Create demo client user
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientPassword,
      firstName: 'Sara',
      lastName: 'Al-Rashid',
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true,
      country: 'SA',
      clientProfile: {
        create: {
          companyName: 'TechVentures SA',
          companySize: '11-50',
          industry: 'Technology',
          website: 'https://techventures.sa',
        },
      },
    },
  });
  console.log(`✅ Created client user: ${client.email} (password: client123)`);

  // Create platform config
  await prisma.platformConfig.upsert({
    where: { key: 'platform_fee_percent' },
    update: {},
    create: {
      key: 'platform_fee_percent',
      value: 10, // 10% platform fee
    },
  });
  console.log('✅ Created platform config');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  Admin:    admin@talentnation.sa / admin123');
  console.log('  Talent:   talent@example.com / talent123');
  console.log('  Client:   client@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
