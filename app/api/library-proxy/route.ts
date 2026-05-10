import { NextRequest, NextResponse } from "next/server";

// Proxy for fetching .excalidrawlib files from external sources like
// libraries.excalidraw.com — avoids CORS issues when fetching from the browser
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 LiveCanvas/1.0",
      },
    });

    if (!response.ok) {
      console.error(`Library fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch library: ${response.statusText}` },
        { status: response.status }
      );
    }

    let data: any;
    const contentType = response.headers.get("content-type") || "";
    
    // Handle JSON response
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Try parsing as JSON anyway
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse response as JSON");
        return NextResponse.json({ error: "Invalid library format" }, { status: 400 });
      }
    }
    
    // Ensure data is not empty
    if (!data) {
      console.warn("Received null/undefined library data");
      return NextResponse.json({ libraryItems: [] });
    }
    
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
      console.warn("Received empty object library data");
      return NextResponse.json({ libraryItems: [] });
    }
    
    if (Array.isArray(data) && data.length === 0) {
      console.warn("Received empty array library data");
      return NextResponse.json({ libraryItems: [] });
    }
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (err) {
    console.error("Library proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch library", details: String(err) }, 
      { status: 500 }
    );
  }
}
