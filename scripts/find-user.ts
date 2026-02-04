import { prisma } from '../src/lib/prisma';

async function findUsers(searchName: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchName,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log(`No users found matching "${searchName}"`);
      console.log('\nListing all users in database:');

      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.email}`);
      });
    } else {
      console.log(`Found ${users.length} user(s) matching "${searchName}":\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}\n`);
      });
    }
  } catch (error) {
    console.error('Error finding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const searchTerm = process.argv[2] || 'Usman';
findUsers(searchTerm);
