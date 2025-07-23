import { sqliteTableCreator } from 'drizzle-orm/sqlite-core';

export const createTable = sqliteTableCreator((name) => `prototype-3_${name}`);
