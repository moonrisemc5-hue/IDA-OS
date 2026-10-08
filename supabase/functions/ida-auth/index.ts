import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}")
const SUPABASE_SECRET_KEY = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
if (!SUPABASE_SECRET_KEY) throw new Error("Missing Supabase secret key")

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })

async function accountEmail(name: string) {
  const normalized = name.trim().normalize("NFKC").toLocaleLowerCase()
  const bytes = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("")
  return `ida-${hash.slice(0, 32)}@accounts.ida.local`
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return respond({ error: "Method not allowed." }, 405)

  try {
    const body = await req.json()
    const action = body?.action
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!name || name.length < 2 || name.length > 40) {
      return respond({ error: "Name must be between 2 and 40 characters." }, 400)
    }
    if (password.length < 8) {
      return respond({ error: "Use a password with at least 8 characters." }, 400)
    }

    const email = await accountEmail(name)

    if (action === "signup") {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: name },
      })

      if (createError) {
        if (/already|exists|registered/i.test(createError.message)) {
          return respond({ error: "That IDA name is already taken. Choose another name." }, 409)
        }
        return respond({ error: createError.message }, 400)
      }

      if (!created.user) return respond({ error: "Could not create the IDA account." }, 500)
    } else if (action !== "signin") {
      return respond({ error: "Unknown account action." }, 400)
    }

    const { data: signedIn, error: signInError } = await admin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signedIn.session) {
      return respond({ error: signInError?.message || "Could not sign in to IDA." }, 401)
    }

    return respond({
      session: signedIn.session,
      displayName: name,
    })
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Could not process the IDA account." }, 500)
  }
})
