import dns from "dns";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL;
const password = process.env.PG_PASSWORD || process.env.PGPASSWORD || process.env.PASSWORD;
const host = process.env.PGHOST || process.env.HOST;
const port = Number(process.env.PGPORT || 5432);
const database = process.env.PGDATABASE || "postgres";
const user = process.env.PGUSER || "postgres";

const getHostFromUrl = (value) => {
  if (!value) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
};

const makePool = (config, useSsl) =>
  new Pool({
    ...config,
    family: 4,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

const primaryPool = makePool(
  connectionString
    ? { connectionString }
    : { host: host || "localhost", port, database, user, password },
  process.env.PGSSL === "disable" ? false : Boolean(connectionString?.includes("sslmode=require"))
);

const hasPoolerConfig = Boolean(host && user && password);
const directHost = getHostFromUrl(connectionString);
const canFallbackToPooler = hasPoolerConfig && (!directHost || directHost !== host);

let fallbackPool = null;
const getFallbackPool = () => {
  if (!fallbackPool) {
    fallbackPool = makePool({ host, port, database, user, password }, true);
  }
  return fallbackPool;
};

const shouldRetryViaPooler = (error) =>
  canFallbackToPooler && (error?.code === "ENETUNREACH" || error?.code === "EHOSTUNREACH");

const pool = {
  async query(text, values) {
    try {
      return await primaryPool.query(text, values);
    } catch (error) {
      if (!shouldRetryViaPooler(error)) throw error;
      return getFallbackPool().query(text, values);
    }
  },
  async end() {
    await primaryPool.end();
    if (fallbackPool) {
      await fallbackPool.end();
    }
  },
};

export default pool;
