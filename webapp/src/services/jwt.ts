import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET || "default_secret";
  return new TextEncoder().encode(secret);
};

export async function createToken(payload: any) {
  const secret = getSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    console.error("Token verification failed:", e);
    return null;
  }
}
