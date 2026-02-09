import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for admin user...')
  
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@instituto-etchegoyen.edu.ar' }
  })
  
  if (adminUser) {
    console.log('✅ Admin user found:')
    console.log(JSON.stringify(adminUser, null, 2))
  } else {
    console.log('❌ Admin user NOT found in database')
    console.log('Creating admin user...')
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@instituto-etchegoyen.edu.ar',
        name: 'Administrador',
        role: 'ADMIN',
      }
    })
    
    console.log('✅ Admin user created:')
    console.log(JSON.stringify(newAdmin, null, 2))
  }
  
  // List all users
  const allUsers = await prisma.user.findMany()
  console.log('\nAll users in database:')
  console.log(JSON.stringify(allUsers, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
