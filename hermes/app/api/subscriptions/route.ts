export const GET = async () => {
  try {
    const headers = new Headers();
    const projectToken = process.env.NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN;
    if (projectToken) {
      headers.set("X-Project-Token", projectToken);
    } else {
      return new Response(JSON.stringify({ error: "Missing project token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const list = await fetch(
      "https://web-tools-ashen.vercel.app/api/lists/subscriptions-plan",
      {
        headers,
      },
    );
    const data = await list.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscriptions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
