import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';
import { cache } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('crm_session');
    const userId = cookieStore.get('crm_user_id');

    if (!session || !userId) {
      return null;
    }

    const users = await sql`
      SELECT id, username, email, user_type
      FROM users 
      WHERE id = ${parseInt(userId.value)}
      LIMIT 1
    `;

    if (users.length === 0) {
      return null;
    }

    return users[0] as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
});

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
