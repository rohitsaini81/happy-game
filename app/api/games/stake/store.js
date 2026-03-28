import crypto from "crypto";

export const GRID_SIDE = 5;
export const TOTAL_TILES = GRID_SIDE * GRID_SIDE;
export const HOUSE_EDGE = 0.97;
const SESSION_TTL_MS = 30 * 60 * 1000;

const globalStore = globalThis;
const sessions = globalStore.__stakeSessions ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalStore.__stakeSessions = sessions;
}

export const calculateMultiplier = (minesCount, safeReveals) => {
  if (safeReveals <= 0) return 1;

  let multiplier = 1;
  for (let i = 0; i < safeReveals; i += 1) {
    multiplier *= (TOTAL_TILES - i) / (TOTAL_TILES - minesCount - i);
  }
  return multiplier * HOUSE_EDGE;
};

const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS || session.status !== "active") {
      sessions.delete(sessionId);
    }
  }
};

const createMineIndexes = (minesCount) => {
  const mineIndexes = new Set();
  while (mineIndexes.size < minesCount) {
    mineIndexes.add(Math.floor(Math.random() * TOTAL_TILES));
  }
  return mineIndexes;
};

export const createStakeSession = (minesCount) => {
  cleanupExpiredSessions();

  const sessionId = crypto.randomUUID();
  const session = {
    id: sessionId,
    minesCount,
    mineIndexes: createMineIndexes(minesCount),
    revealedIndexes: new Set(),
    safeReveals: 0,
    status: "active",
    createdAt: Date.now(),
  };

  sessions.set(sessionId, session);
  return session;
};

export const getStakeSession = (sessionId) => {
  cleanupExpiredSessions();
  return sessions.get(sessionId) || null;
};

export const endStakeSession = (sessionId) => {
  sessions.delete(sessionId);
};

