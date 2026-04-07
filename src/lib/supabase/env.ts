const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

export function getSupabaseEnv() {
  const env = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return {
    ...env,
    isConfigured: Boolean(env.url && env.anonKey),
  };
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv();

  if (env.isConfigured) {
    return {
      url: env.url!,
      anonKey: env.anonKey!,
    };
  }

  const missing = requiredEnvVars.filter(
    (key) => !process.env[key as RequiredEnvVar]
  );

  throw new Error(
    `Missing Supabase environment variables: ${missing.join(", ")}`
  );
}
