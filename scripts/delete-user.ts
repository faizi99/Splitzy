import { prisma } from '../src/lib/prisma';

async function deleteUser(email: string) {
  try {
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      console.log(`❌ User with email "${email}" not found in the database.`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`User ID: ${user.id}`);
    console.log('\nDeleting user and all associated data...');

    // Delete the user (CASCADE will handle related records)
    await prisma.user.delete({
      where: { email },
    });

    console.log(`✅ Successfully deleted user "${user.name}" (${user.email})`);
    console.log('Associated data (accounts, sessions, memberships) have been automatically removed.');
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const emailToDelete = process.argv[2] || 'usmanmalik@example.com';

console.log(`Attempting to delete user with email: ${emailToDelete}\n`);
deleteUser(emailToDelete);
