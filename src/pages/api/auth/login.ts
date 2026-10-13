import type { APIRoute } from "astro"
import {
  verifyPassword,
  createSessionToken,
  COOKIE_NAME,
  SESSION_MAX_AGE,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIp,
} from "@/lib/auth"

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: "Método GET não suportado. Utilize POST." }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  )
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(ip)

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: `Muitas tentativas incorretas. Acesso bloqueado temporariamente por ${rateLimit.retryAfterSeconds} segundos por segurança.`,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return new Response(JSON.stringify({ error: "Senha não fornecida." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const isValid = verifyPassword(password)

    if (!isValid) {
      const failed = recordFailedAttempt(ip)
      return new Response(
        JSON.stringify({
          error: failed.locked
            ? "Senha incorreta. Limite de 5 tentativas excedido. Bloqueado por 15 minutos."
            : `Senha incorreta. Você tem mais ${failed.remainingAttempts} tentativa(s) restante(s).`,
          remainingAttempts: failed.remainingAttempts,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    // Success: reset rate limit and issue secure session cookie
    resetRateLimit(ip)
    const token = createSessionToken()

    cookies.set(COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    })

    return new Response(
      JSON.stringify({ success: true, message: "Autenticado com sucesso." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Erro no processamento da requisição." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
