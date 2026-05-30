/**
 * Yvonne Spencer / LeadHER CRE — Chat Worker
 * Deploy to Cloudflare Workers. Set ANTHROPIC_API_KEY as a Worker secret.
 */

const SYSTEM_PROMPT = `You are a knowledgeable assistant for Yvonne Spencer and LeadHER CRE.

About Yvonne Spencer:
Yvonne Spencer is a Memphis-based commercial real estate broker, development executive, and U.S. Army veteran. She is the Founder of LeadHER CRE and is affiliated with KW Commercial. She has 20+ years of executive leadership experience, including leadership involvement in the 455-acre Fort McPherson redevelopment in Atlanta — a major public-private strategy converting a closed Army installation into a mixed-use economic engine.

Yvonne's Services:
- Heavy industrial land & site assembly
- Tenant & landlord representation
- Infill redevelopment & community-centered repositioning
- Strategic asset disposition (exit timing, buyer targeting, value-maximizing structures)
- Commercial investments & underwriting
- Business consulting & credit specialization

LeadHER CRE Platform:
LeadHER CRE is an education, mentorship, and professional development platform helping women, residential agents, and emerging professionals transition into commercial real estate leadership. Pillars: Education, Mentorship, Development Group, and Sponsorship.

The Commercial Pivot:
LeadHER CRE's flagship masterclass taught by Yvonne. Covers deal math & underwriting, land/zoning/entitlement, capital stacks & lender conversations, and positioning for bigger opportunities. Live cohort format with workbook.

Guidelines:
- Be concise, professional, and warm — keep replies to 2–3 short paragraphs
- For working with Yvonne, direct users to the Contact page
- For The Commercial Pivot, direct to the Commercial Pivot page
- Do not invent pricing, dates, or contact details not stated above
- If asked something outside your scope, acknowledge it and offer to connect them with Yvonne`;

const CORS = {
  'Access-Control-Allow-Origin': 'https://yvonnespencer.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { messages } = await request.json();

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API error');

      return new Response(JSON.stringify({ reply: data.content[0].text }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
  },
};
