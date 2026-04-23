// CORS override for public API
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Project-Token, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export function withCorsHeaders(headers: HeadersInit = {}): HeadersInit {
  return { ...corsHeaders, ...headers };
}

export function corsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
