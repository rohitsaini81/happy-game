import { cookies } from "next/headers";
import pool from "@/app/api/db";
import { getSessionUser } from "@/app/lib/session";

const TABLE = "public.app_user";

export const requireActiveGameUser = async () => {
  const cookieStore = await cookies();
  const sessionUser = getSessionUser(cookieStore);
  const userId = Number(sessionUser?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT id, points, is_active
        FROM ${TABLE}
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const user = rows[0];
    if (!user || user.is_active === false) {
      return { error: "Unauthorized", status: 401 };
    }

    return { user: { id: user.id, points: Number(user.points) || 0 } };
  } catch (error) {
    if (error?.code !== "42703") throw error;

    const { rows } = await pool.query(
      `
        SELECT id, points
        FROM ${TABLE}
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return { error: "Unauthorized", status: 401 };
    }

    return { user: { id: user.id, points: Number(user.points) || 0 } };
  }
};

export const getUserPoints = async (userId) => {
  const { rows } = await pool.query(
    `
      SELECT points
      FROM ${TABLE}
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );
  return Number(rows[0]?.points) || 0;
};

export const debitUserPoints = async (userId, amount) => {
  const debitAmount = Number(amount);
  if (!Number.isInteger(debitAmount) || debitAmount <= 0) return null;

  let rows;
  try {
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points - $1
        WHERE id = $2
          AND is_active = TRUE
          AND points >= $1
        RETURNING points
      `,
      [debitAmount, userId]
    ));
  } catch (error) {
    if (error?.code !== "42703") throw error;
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points - $1
        WHERE id = $2
          AND points >= $1
        RETURNING points
      `,
      [debitAmount, userId]
    ));
  }

  if (!rows[0]) return null;
  return Number(rows[0].points) || 0;
};

export const applyUserBetOutcome = async (userId, betAmount, netDelta) => {
  const bet = Number(betAmount);
  const delta = Number(netDelta);
  if (!Number.isInteger(bet) || bet <= 0 || !Number.isInteger(delta)) return null;

  let rows;
  try {
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points + $3
        WHERE id = $1
          AND is_active = TRUE
          AND points >= $2
        RETURNING points
      `,
      [userId, bet, delta]
    ));
  } catch (error) {
    if (error?.code !== "42703") throw error;
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points + $3
        WHERE id = $1
          AND points >= $2
        RETURNING points
      `,
      [userId, bet, delta]
    ));
  }

  if (!rows[0]) return null;
  return Number(rows[0].points) || 0;
};

export const creditUserPoints = async (userId, amount) => {
  const creditAmount = Number(amount);
  if (!Number.isInteger(creditAmount) || creditAmount < 0) return null;

  let rows;
  try {
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points + $1
        WHERE id = $2
          AND is_active = TRUE
        RETURNING points
      `,
      [creditAmount, userId]
    ));
  } catch (error) {
    if (error?.code !== "42703") throw error;
    ({ rows } = await pool.query(
      `
        UPDATE ${TABLE}
        SET points = points + $1
        WHERE id = $2
        RETURNING points
      `,
      [creditAmount, userId]
    ));
  }

  if (!rows[0]) return null;
  return Number(rows[0].points) || 0;
};
