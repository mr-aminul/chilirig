/**
 * Pathao Courier Merchant API client.
 * Used to create delivery orders in Pathao from the admin dispatch flow.
 * @see https://developer.pathao.com (API docs)
 */

const DEFAULT_BASE_URL = "https://courier-api-sandbox.pathao.com";
const TOKEN_PATH = "/aladdin/api/v1/issue-token";
const ORDERS_PATH = "/aladdin/api/v1/orders";

export interface PathaoTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface PathaoCreateOrderPayload {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_secondary_phone?: string;
  recipient_address: string;
  recipient_city?: number;
  recipient_zone?: number;
  recipient_area?: number;
  delivery_type: number;
  item_type: number;
  item_quantity: number;
  item_weight: string;
  amount_to_collect: number;
  special_instruction?: string;
  item_description?: string;
}

export interface PathaoCity {
  city_id: number;
  city_name: string;
}

export interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

export interface PathaoArea {
  area_id: number;
  area_name: string;
  home_delivery_available?: boolean;
  pickup_available?: boolean;
}

export interface PathaoPriceParams {
  recipient_city: number;
  recipient_zone: number;
  item_weight?: number;
}

export interface PathaoPriceResponse {
  price: number;
  final_price: number;
  cod_enabled?: number;
}

export interface PathaoCreateOrderResponse {
  message: string;
  type: string;
  code: number;
  data: {
    consignment_id: string;
    merchant_order_id?: string;
    order_status: string;
    delivery_fee: number;
  };
}

export interface PathaoCancelOrderResponse {
  message: string;
  type: string;
  code: number;
  data?: unknown;
}

export interface PathaoCancelOrderResult {
  alreadyCancelled: boolean;
}

export interface PathaoOrderInfo {
  consignment_id: string;
  merchant_order_id?: string | null;
  order_status: string;
  order_status_slug: string;
}

/**
 * Pathao reports a cancelled consignment with a status slug such as
 * "Pickup_Cancelled" / "Cancelled". Used to treat retries as success and to
 * distinguish "already cancelled" from "no longer cancellable" (picked up).
 */
function isCancelledOrderStatus(info: PathaoOrderInfo): boolean {
  const slug = (info.order_status_slug || "").toLowerCase();
  const status = (info.order_status || "").toLowerCase();
  return slug.includes("cancel") || status.includes("cancel");
}

function getBaseUrl(): string {
  return process.env.PATHAO_BASE_URL || DEFAULT_BASE_URL;
}

function getAuthHeaders(): { client_id: string; client_secret: string } {
  const client_id = process.env.PATHAO_CLIENT_ID;
  const client_secret = process.env.PATHAO_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error("PATHAO_CLIENT_ID and PATHAO_CLIENT_SECRET are required");
  }
  return { client_id, client_secret };
}

/**
 * Issue an access token using password grant.
 * Use this token in the Authorization header for API calls.
 */
export async function getPathaoAccessToken(): Promise<string> {
  const base = getBaseUrl();
  const { client_id, client_secret } = getAuthHeaders();
  const username = process.env.PATHAO_USERNAME;
  const password = process.env.PATHAO_PASSWORD;
  if (!username || !password) {
    throw new Error("PATHAO_USERNAME and PATHAO_PASSWORD are required");
  }

  const res = await fetch(`${base}${TOKEN_PATH}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id,
      client_secret,
      grant_type: "password",
      username,
      password,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      msg = j.message || j.error || text;
    } catch {
      // use raw text
    }
    throw new Error(`Pathao token failed (${res.status}): ${msg}`);
  }

  let data: PathaoTokenResponse;
  try {
    data = JSON.parse(text) as PathaoTokenResponse;
  } catch {
    throw new Error("Pathao token response was not valid JSON");
  }
  if (!data.access_token) {
    throw new Error("Pathao token response missing access_token");
  }
  return data.access_token;
}

/**
 * Create a new delivery order in Pathao Courier.
 * Requires PATHAO_STORE_ID and auth env vars to be set.
 */
export async function createPathaoOrder(
  payload: PathaoCreateOrderPayload
): Promise<PathaoCreateOrderResponse> {
  const base = getBaseUrl();
  const token = await getPathaoAccessToken();

  const res = await fetch(`${base}${ORDERS_PATH}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: PathaoCreateOrderResponse & { message?: string; type?: string };
  try {
    data = JSON.parse(text) as PathaoCreateOrderResponse & { message?: string; type?: string };
  } catch {
    throw new Error(`Pathao create order failed (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data.message || data.type || res.statusText || text.slice(0, 200);
    throw new Error(`Pathao create order failed (${res.status}): ${msg}`);
  }

  if (data.type !== "success" || data.code !== 200) {
    throw new Error(data.message || "Pathao order creation returned non-success");
  }

  return data as PathaoCreateOrderResponse;
}

/**
 * Get the current status of a consignment.
 * @see GET /aladdin/api/v1/orders/{consignmentId}/info
 */
export async function getPathaoOrderInfo(consignmentId: string): Promise<PathaoOrderInfo> {
  const trimmedId = consignmentId.trim();
  if (!trimmedId) {
    throw new Error("Pathao consignment ID is required");
  }
  return pathaoGet<PathaoOrderInfo>(
    `${ORDERS_PATH}/${encodeURIComponent(trimmedId)}/info`
  );
}

/**
 * Cancel an existing Pathao consignment.
 * @see PUT /aladdin/api/v1/orders/{consignmentId}/cancel
 *
 * If Pathao rejects the cancel, we check the order's actual status: an order
 * already in a cancelled state is treated as success (idempotent retry), while
 * any other state (e.g. picked up / in transit) is surfaced as a real error.
 */
export async function cancelPathaoOrder(
  consignmentId: string
): Promise<PathaoCancelOrderResult> {
  const trimmedId = consignmentId.trim();
  if (!trimmedId) {
    throw new Error("Pathao consignment ID is required");
  }

  const base = getBaseUrl();
  const token = await getPathaoAccessToken();

  // Pathao's cancel endpoint requires PUT. POST returns a misleading
  // 200 body of {"error":true,"success":true,"message":"Unauthorized!"}.
  const res = await fetch(
    `${base}${ORDERS_PATH}/${encodeURIComponent(trimmedId)}/cancel`,
    {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await res.text();
  let data: PathaoCancelOrderResponse & { message?: string; type?: string };
  try {
    data = JSON.parse(text) as PathaoCancelOrderResponse & { message?: string; type?: string };
  } catch {
    throw new Error(`Pathao cancel order failed (${res.status}): ${text.slice(0, 200)}`);
  }

  if (res.ok && data.type === "success" && data.code === 200) {
    return { alreadyCancelled: false };
  }

  const rejectMessage =
    data.message || data.type || res.statusText || text.slice(0, 200);

  // The cancel was rejected. Pathao reuses a vague message
  // ("please contact cx to cancel order") both for orders already cancelled
  // and orders too far along to cancel, so verify against the real status.
  let info: PathaoOrderInfo | null = null;
  try {
    info = await getPathaoOrderInfo(trimmedId);
  } catch {
    // Fall through and surface the original cancel error.
  }

  if (info && isCancelledOrderStatus(info)) {
    return { alreadyCancelled: true };
  }

  const statusSuffix = info ? ` (current status: ${info.order_status})` : "";
  throw new Error(`Pathao cancel order failed: ${rejectMessage}${statusSuffix}`);
}

/**
 * GET request to Pathao API with Bearer token.
 */
async function pathaoGet<T>(path: string): Promise<T> {
  const base = getBaseUrl();
  const token = await getPathaoAccessToken();
  const res = await fetch(`${base}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  let data: { type?: string; code?: number; data?: unknown; message?: string };
  try {
    data = JSON.parse(text) as { type?: string; code?: number; data?: unknown; message?: string };
  } catch {
    throw new Error(`Pathao API error (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || data.type !== "success") {
    throw new Error(data.message || `Pathao API error (${res.status})`);
  }
  return data.data as T;
}

/**
 * Get list of cities (for checkout City dropdown).
 */
export async function getPathaoCities(): Promise<PathaoCity[]> {
  const data = await pathaoGet<{ data: PathaoCity[] }>("/aladdin/api/v1/city-list");
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * Get zones inside a city (for checkout Zone dropdown).
 */
export async function getPathaoZones(cityId: number): Promise<PathaoZone[]> {
  const data = await pathaoGet<{ data: PathaoZone[] }>(
    `/aladdin/api/v1/cities/${cityId}/zone-list`
  );
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * Get areas inside a zone (for checkout Area dropdown).
 */
export async function getPathaoAreas(zoneId: number): Promise<PathaoArea[]> {
  const data = await pathaoGet<{ data: PathaoArea[] }>(
    `/aladdin/api/v1/zones/${zoneId}/area-list`
  );
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * Get delivery price for a city/zone (for checkout shipping cost).
 * Uses store_id from env, item_type=2 (parcel), delivery_type=48 (normal), item_weight=0.5.
 */
export async function getPathaoPrice(
  params: PathaoPriceParams
): Promise<PathaoPriceResponse> {
  const base = getBaseUrl();
  const token = await getPathaoAccessToken();
  const storeId = process.env.PATHAO_STORE_ID;
  if (!storeId) throw new Error("PATHAO_STORE_ID is required for price calculation");

  const body = {
    store_id: parseInt(storeId, 10),
    item_type: 2,
    delivery_type: 48,
    item_weight: params.item_weight ?? 0.5,
    recipient_city: params.recipient_city,
    recipient_zone: params.recipient_zone,
  };

  const res = await fetch(`${base}/aladdin/api/v1/merchant/price-plan`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let response: {
    type?: string;
    code?: number;
    message?: string;
    data?: PathaoPriceResponse;
  };
  try {
    response = JSON.parse(text) as {
      type?: string;
      code?: number;
      message?: string;
      data?: PathaoPriceResponse;
    };
  } catch {
    throw new Error(`Pathao price API error (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok || response.type !== "success") {
    throw new Error(response.message || `Pathao price failed (${res.status})`);
  }

  const data = response.data;
  if (!data) {
    throw new Error("Pathao price response missing data");
  }

  return {
    price: data.price ?? 0,
    final_price: data.final_price ?? data.price ?? 0,
    cod_enabled: data.cod_enabled,
  };
}

/**
 * Normalize Bangladeshi phone to 11 digits (e.g. 01712345678).
 * Strips spaces, dashes, and optional +88 country code.
 */
export function normalizePathaoPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("01")) return digits;
  if (digits.length === 13 && digits.startsWith("8801")) return digits.slice(2);
  if (digits.length === 10 && digits.startsWith("1")) return "0" + digits;
  return digits.slice(-11); // fallback: last 11 digits
}
