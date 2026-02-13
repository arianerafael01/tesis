import { PrismaClient, Shift } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function seedScheduleConfig() {
  console.log('Seeding schedule configurations...');

  // Delete existing configurations
  await prisma.scheduleBreak.deleteMany();
  await prisma.scheduleModule.deleteMany();
  await prisma.schoolScheduleConfig.deleteMany();

  // Create Morning Shift Configuration (Turno Mañana)
  const morningConfig = await prisma.schoolScheduleConfig.create({
    data: {
      name: 'Turno Mañana',
      shift: Shift.MorningShift,
      startTime: '7:30',
      isActive: true,
    },
  });

  // Morning shift breaks: after module 2 (10 min), after module 4 (10 min), after module 6 (10 min)
  await prisma.scheduleBreak.createMany({
    data: [
      { configId: morningConfig.id, afterModule: 2, durationMinutes: 10 },
      { configId: morningConfig.id, afterModule: 4, durationMinutes: 10 },
      { configId: morningConfig.id, afterModule: 6, durationMinutes: 10 },
    ],
  });

  // Calculate and create morning modules
  const morningModules = calculateModules(morningConfig.startTime, 8, [
    { afterModule: 2, duration: 10 },
    { afterModule: 4, duration: 10 },
    { afterModule: 6, duration: 10 },
  ]);

  await prisma.scheduleModule.createMany({
    data: morningModules.map((mod) => ({
      configId: morningConfig.id,
      moduleNumber: mod.number,
      startTime: mod.start,
      endTime: mod.end,
    })),
  });

  console.log(`✓ Created Morning Shift configuration with ${morningModules.length} modules`);

  // Create Afternoon Shift Configuration (Turno Tarde)
  const afternoonConfig = await prisma.schoolScheduleConfig.create({
    data: {
      name: 'Turno Tarde',
      shift: Shift.LateShift,
      startTime: '12:00',
      isActive: true,
    },
  });

  // Afternoon shift breaks: after module 4 (10 min), after module 6 (10 min), after module 8 (10 min), after module 10 (10 min)
  await prisma.scheduleBreak.createMany({
    data: [
      { configId: afternoonConfig.id, afterModule: 4, durationMinutes: 10 },
      { configId: afternoonConfig.id, afterModule: 6, durationMinutes: 10 },
      { configId: afternoonConfig.id, afterModule: 8, durationMinutes: 10 },
      { configId: afternoonConfig.id, afterModule: 10, durationMinutes: 10 },
    ],
  });

  // Calculate and create afternoon modules (note: module 3 is 50 minutes instead of 40)
  const afternoonModules = calculateModulesWithException(afternoonConfig.startTime, 11, [
    { afterModule: 4, duration: 10 },
    { afterModule: 6, duration: 10 },
    { afterModule: 8, duration: 10 },
    { afterModule: 10, duration: 10 },
  ], { moduleNumber: 3, duration: 50 }); // Module 3 is 50 minutes

  await prisma.scheduleModule.createMany({
    data: afternoonModules.map((mod) => ({
      configId: afternoonConfig.id,
      moduleNumber: mod.number,
      startTime: mod.start,
      endTime: mod.end,
    })),
  });

  console.log(`✓ Created Afternoon Shift configuration with ${afternoonModules.length} modules`);
  console.log('✓ Schedule configurations seeded successfully!');
}

// Helper function to calculate module times
function calculateModules(
  startTime: string,
  totalModules: number,
  breaks: { afterModule: number; duration: number }[]
): { number: number; start: string; end: string }[] {
  const modules: { number: number; start: string; end: string }[] = [];
  let currentTime = parseTime(startTime);

  for (let i = 1; i <= totalModules; i++) {
    const start = formatTime(currentTime);
    currentTime = addMinutes(currentTime, 40); // Each module is 40 minutes
    const end = formatTime(currentTime);

    modules.push({ number: i, start, end });

    // Check if there's a break after this module
    const breakAfter = breaks.find((b) => b.afterModule === i);
    if (breakAfter) {
      currentTime = addMinutes(currentTime, breakAfter.duration);
    }
  }

  return modules;
}

// Helper function to calculate module times with exception (for afternoon shift module 3)
function calculateModulesWithException(
  startTime: string,
  totalModules: number,
  breaks: { afterModule: number; duration: number }[],
  exception: { moduleNumber: number; duration: number }
): { number: number; start: string; end: string }[] {
  const modules: { number: number; start: string; end: string }[] = [];
  let currentTime = parseTime(startTime);

  for (let i = 1; i <= totalModules; i++) {
    const start = formatTime(currentTime);
    const moduleDuration = i === exception.moduleNumber ? exception.duration : 40;
    currentTime = addMinutes(currentTime, moduleDuration);
    const end = formatTime(currentTime);

    modules.push({ number: i, start, end });

    // Check if there's a break after this module
    const breakAfter = breaks.find((b) => b.afterModule === i);
    if (breakAfter) {
      currentTime = addMinutes(currentTime, breakAfter.duration);
    }
  }

  return modules;
}

// Parse time string "HH:MM" to minutes since midnight
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format minutes since midnight to "HH:MM"
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Add minutes to a time value
function addMinutes(time: number, minutes: number): number {
  return time + minutes;
}

seedScheduleConfig()
  .catch((e) => {
    console.error('Error seeding schedule config:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
