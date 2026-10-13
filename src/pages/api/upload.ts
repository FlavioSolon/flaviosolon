import type { APIRoute } from "astro"
import { processUploadedImage } from "@/lib/images"
import { saveMediaItem } from "@/lib/db"
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth"

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: "Método GET não suportado. Utilize POST com multipart/form-data.",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  )
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
    const formData = await request.formData()
    const file = formData.get("image") as File | null
    const altText = formData.get("altText") as string || ""

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Nenhum arquivo enviado." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Read bytes into Node Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process with Sharp to produce WebP and AVIF automatically
    const result = await processUploadedImage(buffer, file.name, altText)
    saveMediaItem(result.media)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("Erro no upload de imagem:", err)
    return new Response(
      JSON.stringify({
        error:
          err.message || "Falha ao processar e converter imagem com Sharp.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
