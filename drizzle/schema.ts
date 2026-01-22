import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela para armazenar dados de acidentes agregados por UF
export const accidentStats = mysqlTable("accident_stats", {
  id: int("id").autoincrement().primaryKey(),
  uf: varchar("uf", { length: 2 }).notNull().unique(),
  totalAccidents: int("total_accidents").notNull(),
  totalDeaths: int("total_deaths").notNull(),
  totalSevereInjuries: int("total_severe_injuries").notNull(),
  totalMinorInjuries: int("total_minor_injuries").notNull(),
  totalUnharmed: int("total_unharmed").notNull(),
  dataJson: text("data_json").notNull(), // Armazena JSON com detalhes por causa, dia, etc
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AccidentStats = typeof accidentStats.$inferSelect;
export type InsertAccidentStats = typeof accidentStats.$inferInsert;