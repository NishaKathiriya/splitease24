import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, members, partialExpense } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Parsing expense from message:", message);

    // If we have a partial expense with amount/description and user now sent a payer name, resolve immediately
    if (partialExpense && !partialExpense.payer && partialExpense.amount && partialExpense.description) {
      const lowerMsg = String(message).toLowerCase().trim();
      const matched = members.find((m: string) => lowerMsg === m.toLowerCase() || lowerMsg.includes(m.toLowerCase()));
      if (matched) {
        const completed = { ...partialExpense, payer: matched };
        return new Response(
          JSON.stringify({ expense: completed }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const systemPrompt = `You are an expense parsing AI. Extract expense details from natural language.
    
Available members: ${members.join(", ")}

Extract:
- payer: Who paid (must match one of the members exactly, or null if unclear)
- amount: Numeric value only
- description: What was purchased
- category: One of: Food, Transport, Entertainment, Shopping, Utilities, General

IMPORTANT: If the user says "I" or doesn't specify who paid, set payer to null.

Examples:
"I paid $30 for pizza" → {"payer": null, "amount": 30, "description": "pizza", "category": "Food"}
"Bob spent 50 on uber" → {"payer": "Bob", "amount": 50, "description": "uber", "category": "Transport"}
"Spent $25 on groceries" → {"payer": null, "amount": 25, "description": "groceries", "category": "Shopping"}

Return ONLY valid JSON with these exact fields.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI response:", aiResponse);

    // Extract JSON from response (handle markdown code blocks)
    let expenseData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        expenseData = JSON.parse(jsonMatch[0]);
      } else {
        expenseData = JSON.parse(aiResponse);
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", aiResponse);
      const clarification = "I need more information to parse the expense. Please include an amount and a short description, e.g., '$20 for lunch'.";
      return new Response(
        JSON.stringify({ needsClarification: true, message: clarification, partialExpense: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!expenseData.amount || !expenseData.description) {
      const missing = [
        !expenseData.amount ? "amount" : null,
        !expenseData.description ? "description" : null
      ].filter(Boolean).join(" and ");
      const msg = `Please provide the ${missing} for this expense (e.g., '$25 for groceries').`;
      return new Response(
        JSON.stringify({ needsClarification: true, message: msg, partialExpense: expenseData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If payer is null, return a clarification request
    if (!expenseData.payer) {
      return new Response(
        JSON.stringify({ 
          needsClarification: true,
          message: `Got it! $${expenseData.amount} for ${expenseData.description}. Who paid for this? (${members.join(", ")})`,
          partialExpense: expenseData
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ expense: expenseData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Parse expense error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to parse expense" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
