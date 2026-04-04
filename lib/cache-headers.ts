/** Use on API Route responses so browsers and shared caches do not retain JSON. */
export const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;
