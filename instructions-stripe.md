# Stripe Setup for GripCo

Follow these steps to integrate Stripe payments into the GripCo application.

## 1. Create a Stripe Account
Go to [stripe.com](https://stripe.com) and create an account if you don't have one.

## 2. Get API Keys
In your Stripe Dashboard, go to **Developers > API keys**.
- Copy the **Publishable key** (starts with `pk_test_`).
- Copy the **Secret key** (starts with `sk_test_`).

## 3. Configure Environment Variables
Add your keys to the `.env` file or your frontend environment configuration:
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## 4. Supabase Edge Functions (Optional but Recommended)
To create Payment Intents securely, it's best to use a Supabase Edge Function or a serverless backend.
Example workflow:
1. Frontend calls Edge Function `create-payment-intent` with the order amount.
2. Edge Function uses the Stripe Secret Key to create the intent.
3. Edge Function returns the `client_secret` to the frontend.
4. Frontend uses the `client_secret` to confirm the payment with Stripe Elements.

## 5. Webhooks
To update the order status to "Paid" automatically, set up a Stripe Webhook that listens for `payment_intent.succeeded` and updates the Supabase `orders` table.
