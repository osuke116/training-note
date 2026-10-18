import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const userState = sqliteTable('user_state', {
 owner: text('owner').primaryKey(), payload: text('payload').notNull(),
 revision: integer('revision').notNull().default(0), updatedAt: text('updated_at').notNull(),
});
export const aiUsage = sqliteTable('ai_usage', {
 key: text('key').primaryKey(), count: integer('count').notNull().default(0),
});
