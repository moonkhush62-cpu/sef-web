const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { domain } = await req.json()
    
    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean domain
    const cleanDomain = domain.replace(/^www\./, '').toLowerCase().trim()

    // Try RDAP lookup (free, no API key needed)
    let creationDate: string | null = null

    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
        headers: { 'Accept': 'application/rdap+json' },
        signal: AbortSignal.timeout(8000),
      })

      if (rdapRes.ok) {
        const data = await rdapRes.json()
        // Look for registration event
        if (data.events && Array.isArray(data.events)) {
          const regEvent = data.events.find(
            (e: { eventAction: string }) => e.eventAction === 'registration'
          )
          if (regEvent?.eventDate) {
            creationDate = regEvent.eventDate
          }
        }
      }
    } catch (rdapErr) {
      console.log('RDAP lookup failed, trying fallback:', rdapErr)
    }

    if (!creationDate) {
      // Fallback: try a different RDAP source
      try {
        const fallbackRes = await fetch(
          `https://rdap.verisign.com/com/v1/domain/${cleanDomain}`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (fallbackRes.ok) {
          const data = await fallbackRes.json()
          if (data.events && Array.isArray(data.events)) {
            const regEvent = data.events.find(
              (e: { eventAction: string }) => e.eventAction === 'registration'
            )
            if (regEvent?.eventDate) {
              creationDate = regEvent.eventDate
            }
          }
        } else {
          await fallbackRes.text() // consume body
        }
      } catch {
        console.log('Fallback RDAP also failed')
      }
    }

    if (creationDate) {
      const created = new Date(creationDate)
      const now = new Date()
      const ageMs = now.getTime() - created.getTime()
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
      const ageMonths = Math.floor(ageDays / 30)

      return new Response(JSON.stringify({
        domain: cleanDomain,
        creationDate,
        ageDays,
        ageMonths,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      domain: cleanDomain,
      creationDate: null,
      ageDays: null,
      ageMonths: null,
      note: 'Could not determine domain age',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
