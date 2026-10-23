import { db } from './index.ts';
import { users } from './schema.ts';

// In-memory fallback for authenticated users
const inMemoryUsers = new Map<string, {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}>();
let nextUserId = 1;

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  photoUrl?: string
) {
  if (db) {
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

      if (result && result[0]) {
        return result[0];
      }
    } catch (error) {
      console.warn('Error synchronizing user to Cloud SQL, using memory store:', error);
    }
  }

  // Fallback to in-memory store
  const existing = inMemoryUsers.get(uid);
  if (existing) {
    existing.email = email;
    if (name) existing.name = name;
    if (photoUrl) existing.photoUrl = photoUrl;
    existing.lastLoginAt = new Date();
    return existing;
  }

  const newUser = {
    id: nextUserId++,
    uid,
    email,
    name: name || null,
    photoUrl: photoUrl || null,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };
  inMemoryUsers.set(uid, newUser);
  return newUser;
}

