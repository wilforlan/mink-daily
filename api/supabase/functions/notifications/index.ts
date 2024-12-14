// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");


async function sendEmailWithFetch(input: any) {
    const { emailData, email, subject } = input;
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC") || '';
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE") || '';

    // Encode the API keys in base64 for Basic Authentication
    const credentials = btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`);

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
            "Messages": [
                {
                    "From": {
                        "Email": "do-not-reply@usemink.com",
                        "Name": "Mink Notifications"
                    },
                    "To": [
                        {
                            "Email": email,
                        }
                    ],
                    "TemplateID": 6425256,
                    "TemplateLanguage": true,
                    "Subject": subject,
                    "Variables": {
                        "message": emailData.message,
                    }
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

Deno.serve(async (req) => {
  try {
    const { emailData, email, subject } = await req.json()
    const data = {
      emailData,
      email,
      subject
    }

    // Use the new fetch-based email sending function
    const response = await sendEmailWithFetch(data);
    console.log(response);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false }),
      { headers: { "Content-Type": "application/json" } },
    )
  }
})
