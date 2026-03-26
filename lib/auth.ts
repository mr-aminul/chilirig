export const ADMIN_AUTH_COOKIE_NAME = "admin-auth";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_VERSION = "v1";

function getCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${key}=`)) {
      return decodeURIComponent(cookie.slice(key.length + 1));
    }
  }
  return null;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${SESSION_VERSION}.${exp}`;
  const signature = await signPayload(payload, secret);
  return `${payload}.${signature}`;
}

async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret) return false;

  const [version, expRaw, sigRaw] = token.split(".");
  if (version !== SESSION_VERSION) return false;
  if (!expRaw || !/^\d+$/.test(expRaw)) return false;
  if (!sigRaw || !/^[a-f0-9]{64}$/.test(sigRaw)) return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${version}.${expRaw}`;
  const expectedSig = await signPayload(payload, secret);
  return sigRaw === expectedSig;
}

export async function isAuthenticated(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  const adminToken = getCookieValue(cookieHeader, ADMIN_AUTH_COOKIE_NAME);
  if (adminToken && (await verifyAdminSessionToken(adminToken))) {
    return true;
  }

  const apiKey = request.headers.get("x-api-key");
  const adminKey = request.headers.get("x-admin-key");

  const expectedApiKey = process.env.API_KEY;
  const expectedAdminKey = process.env.ADMIN_KEY;

  if (apiKey && expectedApiKey && apiKey === expectedApiKey) {
    return true;
  }
  if (adminKey && expectedAdminKey && adminKey === expectedAdminKey) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token && (token === expectedApiKey || token === expectedAdminKey)) {
      return true;
    }
  }

  return false;
}

export async function requireAuth(request: Request): Promise<Response | null> {
  if (await isAuthenticated(request)) {
    return null;
  }
  return new Response(
    JSON.stringify({
      success: false,
      error: "Unauthorized. Authentication required.",
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "Bearer",
      },
    }
  );
}
