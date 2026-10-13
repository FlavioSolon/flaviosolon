import { getProfile, updateProfile } from "@/lib/db"
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth"

export const GET: APIRoute = async () => {
  const profile = getProfile()
  return new Response(JSON.stringify(profile), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get(COOKIE_NAME)?.value
  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await request.json()
    const updated = updateProfile(body)
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
