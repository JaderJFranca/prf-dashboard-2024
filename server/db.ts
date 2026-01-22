import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, accidentStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function loadAccidentData(data: any): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot load accident data: database not available");
    return;
  }

  try {
    for (const [uf, stats] of Object.entries(data.ufs)) {
      const ufStats = stats as any;
      await db.insert(accidentStats).values({
        uf: uf,
        totalAccidents: ufStats.total_acidentes,
        totalDeaths: ufStats.total_mortos,
        totalSevereInjuries: ufStats.total_feridos_graves,
        totalMinorInjuries: ufStats.total_feridos_leves,
        totalUnharmed: ufStats.total_ilesos,
        dataJson: JSON.stringify({
          causas: data.causas_por_uf[uf] || [],
          dias: data.dias_semana_por_uf[uf] || [],
          fases: data.fase_dia_por_uf[uf] || [],
          condicoes: data.condicao_metereologica_por_uf[uf] || [],
          pistas: data.tipo_pista_por_uf[uf] || [],
          classificacoes: data.classificacao_por_uf[uf] || [],
        }),
      }).onDuplicateKeyUpdate({
        set: {
          totalAccidents: ufStats.total_acidentes,
          totalDeaths: ufStats.total_mortos,
          totalSevereInjuries: ufStats.total_feridos_graves,
          totalMinorInjuries: ufStats.total_feridos_leves,
          totalUnharmed: ufStats.total_ilesos,
          dataJson: JSON.stringify({
            causas: data.causas_por_uf[uf] || [],
            dias: data.dias_semana_por_uf[uf] || [],
            fases: data.fase_dia_por_uf[uf] || [],
            condicoes: data.condicao_metereologica_por_uf[uf] || [],
            pistas: data.tipo_pista_por_uf[uf] || [],
            classificacoes: data.classificacao_por_uf[uf] || [],
          }),
        },
      });
    }
    console.log("[Database] Accident data loaded successfully");
  } catch (error) {
    console.error("[Database] Failed to load accident data:", error);
    throw error;
  }
}

export async function getAccidentStatsFromDb(uf?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get accident stats: database not available");
    return undefined;
  }

  try {
    if (uf) {
      const result = await db.select().from(accidentStats).where(eq(accidentStats.uf, uf)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } else {
      return await db.select().from(accidentStats);
    }
  } catch (error) {
    console.error("[Database] Failed to get accident stats:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
