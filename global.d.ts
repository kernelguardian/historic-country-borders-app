// declare process.env values
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_GITHUB_API: string;
    NEXT_GA_MEASUREMENT_ID: string;
    NEXT_PUBLIC_DISCORD_WEBHOOK_URL: string;
    NEXT_PUBLIC_ENV: string;
  }
}
