const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Multiple RDAP endpoints to try in order
const RDAP_ENDPOINTS = [
  (domain: string) => `https://rdap.org/domain/${domain}`,
  (domain: string) => `https://rdap.iana.org/domain/${domain}`,
  (domain: string) => `https://rdap.verisign.com/com/v1/domain/${domain}`,
  (domain: string) => `https://rdap.nominet.uk/uk/domain/${domain}`,
]

async function tryRdapLookup(domain: string): Promise<string | null> {
  for (const endpointFn of RDAP_ENDPOINTS) {
    const url = endpointFn(domain)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(url, {
        headers: { 'Accept': 'application/rdap+json, application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        await res.text() // drain body
        continue
      }

      const data = await res.json()

      // Standard RDAP events array
      if (data.events && Array.isArray(data.events)) {
        const regEvent = data.events.find(
          (e: { eventAction: string }) =>
            e.eventAction === 'registration' || e.eventAction === 'Registration'
        )
        if (regEvent?.eventDate) return regEvent.eventDate
      }

      // Some registries use notices or other fields
      if (data.registrationDate) return data.registrationDate
      if (data.created) return data.created

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // DNS failure, network unreachable, or timeout — try next endpoint
      console.log(`RDAP endpoint ${url} failed: ${msg}`)
      continue
    }
  }
  return null
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const domain: unknown = body?.domain

    if (!domain || typeof domain !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitise: strip www., lowercase, trim
    const cleanDomain = domain.replace(/^www\./i, '').toLowerCase().trim()

    // Reject obviously invalid domains
    if (!cleanDomain.includes('.') || cleanDomain.length < 3) {
      return new Response(
        JSON.stringify({
          domain: cleanDomain,
          creationDate: null,
          ageDays: null,
          ageMonths: null,
          note: 'Invalid domain',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const creationDate = await tryRdapLookup(cleanDomain)

    if (creationDate) {
      const created = new Date(creationDate)
      const now = new Date()
      const ageMs = now.getTime() - created.getTime()
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
      const ageMonths = Math.floor(ageDays / 30)

      return new Response(
        JSON.stringify({ domain: cleanDomain, creationDate, ageDays, ageMonths }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Could not determine age — return nulls so frontend degrades gracefully
    return new Response(
      JSON.stringify({
        domain: cleanDomain,
        creationDate: null,
        ageDays: null,
        ageMonths: null,
        note: 'Could not determine domain age from any RDAP source',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
