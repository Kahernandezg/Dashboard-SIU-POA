import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  photoUrl?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(photoUrl ? { photoUrl } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error synchronizing user to Cloud SQL:', error);
    throw new Error('Database operation failed. Unable to synchronize user profile.', {
      cause: error,
    });
  }
}
