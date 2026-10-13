import type { APIRoute } from "astro"
import { COOKIE_NAME } from "@/lib/auth"

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: "Método GET não suportado. Utilize POST." }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  )
}

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(COOKIE_NAME, { path: "/" })
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
