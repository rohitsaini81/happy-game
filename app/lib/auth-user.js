import pool from "@/app/api/db";

const TABLE = "public.app_user";
const DEFAULT_USER_TYPE_ID = 4;
const DEFAULT_POINTS = 1000;

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const toSessionUser = (row) => ({
  id: row.id,
  user_type_id: row.user_type_id,
  name: row.name,
  email: row.email,
  picture: row.profile_picture,
  points: row.points ?? DEFAULT_POINTS,
});

export const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const { rows } = await pool.query(
    `
      SELECT
        id,
        user_type_id,
        name,
        email,
        password_hash,
        profile_picture,
        points,
        is_active
      FROM ${TABLE}
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  return rows[0] || null;
};

export const createUserWithPassword = async ({ name, email, passwordHash }) => {
  const normalizedEmail = normalizeEmail(email);

  const { rows } = await pool.query(
    `
      INSERT INTO ${TABLE}
        (user_type_id, name, email, password_hash, is_active, points)
      VALUES
        ($1, $2, $3, $4, TRUE, $5)
      RETURNING
        id, user_type_id, name, email, profile_picture, points, is_active
    `,
    [DEFAULT_USER_TYPE_ID, String(name || "").trim(), normalizedEmail, passwordHash, DEFAULT_POINTS]
  );

  return rows[0];
};

export const upsertGoogleUser = async ({ name, email, picture }) => {
  const normalizedEmail = normalizeEmail(email);

  const { rows } = await pool.query(
    `
      INSERT INTO ${TABLE}
        (user_type_id, name, email, profile_picture, is_active, points)
      VALUES
        ($1, $2, $3, $4, TRUE, $5)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        profile_picture = COALESCE(EXCLUDED.profile_picture, app_user.profile_picture),
        is_active = TRUE,
        points = COALESCE(app_user.points, EXCLUDED.points)
      RETURNING
        id, user_type_id, name, email, profile_picture, points, is_active
    `,
    [DEFAULT_USER_TYPE_ID, String(name || "").trim() || "Google User", normalizedEmail, picture || null, DEFAULT_POINTS]
  );

  return rows[0];
};

export const AUTH_DEFAULTS = {
  defaultUserTypeId: DEFAULT_USER_TYPE_ID,
  defaultPoints: DEFAULT_POINTS,
};
