## Deployment: Environment Variables for Vercel

To deploy this project on Vercel, set the following environment variables in your Vercel project settings:

- `OPENAI_API_KEY` — Your OpenAI GPT-4o API key (keep this secret!)
- `OPENAI_API_ENDPOINT` — The endpoint for the OpenAI GPT-4o realtime API (e.g., https://your-resource.openai.azure.com)

You can add these in the Vercel dashboard under Project Settings > Environment Variables. Make sure to use the same variable names as in your `.env.local` file for local development. 