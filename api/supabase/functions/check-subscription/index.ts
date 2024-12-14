import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const getSubsciption = async (email: string, productId: string) => {
  const customerResp = await stripe.customers.list({
    email,
    limit: 1
  })

  if (customerResp.data.length === 0) {
    throw new Error(`No customer data found for ${email}`)
  }

  const [customer] = customerResp.data

  const subscriptionResp = await stripe.subscriptions.list({
    customer: customer.id
  })

  const minkSubscription = subscriptionResp.data.find(
    (subscription) => subscription.plan.product === productId
  );
  
  if (!minkSubscription) {
    throw new Error(`No subscription found for customer id ${customer.id}`)
  }

  return minkSubscription
}

Deno.serve(async (req) => {
  try {
    const { email, productId } = await req.json()

    const subscription = await getSubsciption(email, productId)

    return new Response(
      JSON.stringify({ isPaidUser: subscription.status === 'active' }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ isPaidUser: false }),
      { headers: { "Content-Type": "application/json" } },
    )
  }
})