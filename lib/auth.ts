/**
 * Simple authentication middleware for admin routes and API endpoints
 * Uses cookie-based authentication for admin dashboard
 * Also supports API key authentication for API routes
 */

export function isAuthenticated(request: Request): boolean {
  // Check for admin authentication cookie (for dashboard access)
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader?.includes("admin-auth=authenticated")) {
    return true;
  }

  // Fallback: Check for API key from request header (for API routes)
  const apiKey = request.headers.get("x-api-key");
  const adminKey = request.headers.get("x-admin-key");
  
  // Get expected keys from environment variables
  const expectedApiKey = process.env.API_KEY;
  const expectedAdminKey = process.env.ADMIN_KEY;
  
  // Check if provided key matches expected key
  if (apiKey && apiKey === expectedApiKey) {
    return true;
  }
  
  if (adminKey && adminKey === expectedAdminKey) {
    return true;
  }
  
  // Also check for Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === expectedApiKey || token === expectedAdminKey) {
      return true;
    }
  }
  
  return false;
}

export function requireAuth(request: Request): Response | null {
  if (!isAuthenticated(request)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Unauthorized. Authentication required." 
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
  return null;
}
