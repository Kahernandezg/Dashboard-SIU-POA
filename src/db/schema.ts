import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Tabla de usuarios sincronizada con Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla para almacenamiento y sincronización centralizada de años POA & SIU
export const reports = pgTable('reports', {
  year: integer('year').primaryKey(),
  status: text('status').notNull().default('en_proceso'),
  data: jsonb('data').notNull(),
  modifiedBy: text('modified_by'),
  lastModified: timestamp('last_modified').defaultNow(),
});

// Tabla de bitácora y auditoría de cambios
export const changeLogs = pgTable('change_logs', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  module: text('module').notNull(),
  section: text('section').notNull(),
  action: text('action').notNull(),
  user: text('user').notNull(),
  timestamp: text('timestamp').notNull(),
  detail: text('detail'),
});
