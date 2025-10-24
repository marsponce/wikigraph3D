import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const limit = searchParams.get("limit") || "10"; // Default limit is 10

    const url = `https://api.wikimedia.org/core/v1/wikipedia/en/search/page?q=${title}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.WIKIMEDIA_ACCESS_TOKEN}`,
        "User-Agent": `${process.env.APP_NAME} (${process.env.CONTACT})`,
      },
    });
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      console.error("!res.ok");
      return NextResponse.json(
        { error: "Error searching for article" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      pages: data.pages,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          code: (err.cause as { code?: string })?.code ?? "UNKNOWN_ERROR_CODE",
        },
        { status: 500 },
      );
    }
  }
}
