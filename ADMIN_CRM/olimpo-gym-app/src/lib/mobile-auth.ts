import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET || "fallback-dev-secret-change-in-prod"
);

export interface MobileJWTPayload {
  memberId: string;
  email: string;
  gymId: string;
}

export async function signMobileJWT(payload: MobileJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(SECRET);
}

export async function verifyMobileJWT(token: string): Promise<MobileJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      memberId: payload.memberId as string,
      email: payload.email as string,
      gymId: payload.gymId as string,
    };
  } catch {
    return null;
  }
}

export async function getMobileAuth(req: NextRequest): Promise<MobileJWTPayload | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyMobileJWT(token);
}
