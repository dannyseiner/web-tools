import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { Organizations } from "@/lib/convex-types";

type SuccessResponse = {
  success: true;
  data: Organizations;
  count: number;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: Request,
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Fetch all organizations from Convex (public query - no auth needed)
    const organizations: Organizations = await convex.query(
      api.organizations.getAllOrganizations,
      {},
    );

    // Return as JSON with CORS headers
    const response: SuccessResponse = {
      success: true,
      data: organizations,
      count: organizations.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: "Failed to fetch organizations",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
