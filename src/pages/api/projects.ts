import type { APIRoute } from "astro"
import {
  getProjects,
  getProjectById,
  saveProject,
  deleteProject,
} from "@/lib/db"
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth"

function requireAuth(cookies: any): boolean {
  const token = cookies.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id")
  if (id) {
    const project = getProjectById(id)
    if (!project) {
      return new Response(JSON.stringify({ error: "Projeto não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const projects = getProjects()
  return new Response(JSON.stringify(projects), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await request.json()
    if (!body.title || !body.id) {
      return new Response(
        JSON.stringify({ error: "Título e ID são obrigatórios." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const saved = saveProject(body)
    return new Response(JSON.stringify(saved), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return new Response(JSON.stringify({ error: "ID é obrigatório." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const saved = saveProject(body)
    return new Response(JSON.stringify(saved), {
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

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const id = url.searchParams.get("id")
  if (!id) {
    return new Response(JSON.stringify({ error: "ID não fornecido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const success = deleteProject(id)
  if (!success) {
    return new Response(
      JSON.stringify({ error: "Projeto não encontrado para remoção." }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
