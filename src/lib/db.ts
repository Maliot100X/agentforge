import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Lazily initialize so module import at build time doesn't throw
// when DATABASE_URL isn't set yet (Vercel static analysis phase).
let _sql: NeonQueryFunction<false, false> | undefined;

function sql(...args: Parameters<NeonQueryFunction<false, false>>) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql(...args);
}

export default sql as NeonQueryFunction<false, false>;
