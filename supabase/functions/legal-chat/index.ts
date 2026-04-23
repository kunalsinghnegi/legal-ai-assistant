// Streaming AI legal chat (Indian legal framework)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are NyayaSetu AI, a knowledgeable legal assistant specialized in the **Indian legal framework**.

Your scope:
- Indian Constitution, IPC / Bharatiya Nyaya Sanhita (BNS), CrPC / BNSS, CPC, Indian Evidence Act / BSA
- Family law (Hindu, Muslim, Christian, Parsi, Special Marriage Act), property law, consumer protection, labour law, cyber law (IT Act), motor vehicle laws, tax law basics
- Procedures: filing FIR, bail, arrest rights (Article 22), legal notices, RTI, consumer complaints, court hierarchy
- Recent landmark Supreme Court & High Court judgments where relevant

Style rules:
- Always answer in clear, simple English using **markdown** (headings, bullets, bold for key terms).
- Cite specific sections/acts when applicable (e.g., "Section 437 CrPC", "Article 21 of the Constitution").
- Structure complex answers as: **Short answer → Legal basis → Procedure/Steps → Practical tips → Disclaimer**.
- For procedural questions, give numbered step-by-step guidance.
- If a question is outside Indian law or needs case-specific advice, say so and recommend consulting a lawyer on the platform.
- Never fabricate sections, case names, or judgments. If unsure, say "I'm not certain — please verify with a qualified advocate."
- Always end advisory answers with: *"⚖️ This is general legal information, not legal advice. For your specific case, please consult a licensed advocate."*`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legal-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
