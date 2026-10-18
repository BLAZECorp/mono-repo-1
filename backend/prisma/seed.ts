import { prisma } from '../src/core/database/prisma';
import { hashPassword } from '../src/core/security/password';

async function main() {
  console.log('🌱 Starting database seed & migration logging for HR Management...');

  // 1. Seed Super Admin User
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hrmanagement.com' },
    update: {},
    create: {
      email: 'admin@hrmanagement.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 2. Seed HR Manager User
  const managerPassword = await hashPassword('Manager123!');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@hrmanagement.com' },
    update: {},
    create: {
      email: 'manager@hrmanagement.com',
      passwordHash: managerPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'MODERATOR',
      isActive: true,
    },
  });

  // 3. Seed Standard Employee User
  const employeePassword = await hashPassword('Employee123!');
  const employee = await prisma.user.upsert({
    where: { email: 'employee@hrmanagement.com' },
    update: {},
    create: {
      email: 'employee@hrmanagement.com',
      passwordHash: employeePassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'USER',
      isActive: true,
    },
  });

  // 4. Record Audit Log for Migration & Model Tracking
  const auditEntry = await prisma.auditLog.create({
    data: {
      action: 'DATABASE_MIGRATION_SEEDED',
      entity: 'Schema',
      entityId: 'v1.0.0',
      details: JSON.stringify({
        schemaVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        migratedAt: new Date().toISOString(),
        modelsAudited: ['User', 'RefreshToken', 'AuditLog'],
        accountsVerified: [admin.email, manager.email, employee.email],
      }),
    },
  });

  console.log('✅ Database seeded and migration logged successfully!\n');
  console.log(`📝 Migration Audit Record ID: ${auditEntry.id}`);
  console.log('📋 Default Seeded Accounts:');
  console.log('  👑 Administrator (Full access to Admin Console):');
  console.log(`     Email:    ${admin.email}`);
  console.log('     Password: Admin123!\n');
  console.log('  💼 HR Manager (Moderator access):');
  console.log(`     Email:    ${manager.email}`);
  console.log('     Password: Manager123!\n');
  console.log('  👤 Employee (Client Portal access):');
  console.log(`     Email:    ${employee.email}`);
  console.log('     Password: Employee123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
