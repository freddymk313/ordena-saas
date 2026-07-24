import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ordena_table_session_secret_3h_key_2026"
);

export interface TableSessionPayload {
  tableId: string;
  tenantId: string;
  qrToken: string;
  tableLabel: string;
}

/**
 * Sign a 3-hour JWT table session token
 */
export async function signTableToken(payload: TableSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3h")
    .sign(JWT_SECRET);
}

/**
 * Verify table session token
 */
export async function verifyTableToken(token: string): Promise<TableSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TableSessionPayload;
  } catch (err) {
    console.error("Table token verification failed:", err);
    return null;
  }
}
