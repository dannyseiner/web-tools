const API_BASE = "https://web-tools-ashen.vercel.app/api";
// const API_BASE = "http://localhost:3000/api";

export async function get(endpoint, token) {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            "X-Project-Token": token,
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${endpoint} failed (${res.status})${text ? `: ${text}` : ""}`);
    }
    return res.json();
}

export async function post(endpoint, token, body) {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Project-Token": token,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST ${endpoint} failed (${res.status})${text ? `: ${text}` : ""}`);
    }
    return res.json();
}
