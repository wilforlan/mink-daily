// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from OpenAI Function!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const OPENAI_API_KEY = Deno.env.get("MINK_OPENAI_API_KEY");
Deno.serve(async (req) => {
  // Extract the request body
  const requestBody = await req.json();

  // Define the OpenAI API endpoint
  const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

  // Forward the request to OpenAI
  const openAIResponse = await fetch(openAIEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      ...req.headers,
    },
    body: JSON.stringify(requestBody),
  });

  // Get the response data from OpenAI
  const responseData = await openAIResponse.json();

  // Return the response from OpenAI
  return new Response(
    JSON.stringify(responseData),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/openai' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
