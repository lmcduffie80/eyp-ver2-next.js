/**
 * Database connection helper.
 * Supports Neon/Vercel Postgres (DATABASE_URL / POSTGRES_URL) and
 * AWS RDS with IAM auth (AWS_ROLE_ARN + PGHOST + PGUSER).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pool } from 'pg';

const useVercelPostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const useAWSSigner = !!(
  process.env.AWS_ROLE_ARN &&
  process.env.PGHOST &&
  process.env.PGUSER
);

// ─── Neon / standard Postgres pool ───────────────────────────────────────────

let pgPool: Pool | null = null;

async function getPgPool(): Promise<Pool> {
  if (!pgPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    pgPool = new Pool({
      connectionString,
      ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pgPool;
}

// ─── AWS RDS IAM pool ─────────────────────────────────────────────────────────

let awsSigner: any = null;
let awsPool: Pool | null = null;
let signerInitialized = false;

async function initAWSSigner(): Promise<void> {
  if (signerInitialized || !useAWSSigner || useVercelPostgres) return;
  try {
    const { Signer } = await import('@aws-sdk/rds-signer' as any);
    const { awsCredentialsProvider } = await import('@vercel/oidc-aws-credentials-provider' as any);
    awsSigner = new Signer({
      hostname: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      username: process.env.PGUSER,
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_REGION ?? 'us-east-1' },
      }),
    });
    signerInitialized = true;
  } catch (error) {
    console.error('Failed to initialize AWS signer:', error);
    throw error;
  }
}

async function getAWSPool(): Promise<Pool | null> {
  await initAWSSigner();
  if (!awsPool && awsSigner) {
    const authToken = await awsSigner.getAuthToken();
    awsPool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE ?? 'postgres',
      password: authToken,
      port: Number(process.env.PGPORT ?? 5432),
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    awsPool.on('error', async (err: Error) => {
      console.error('Unexpected error on idle database client:', err);
      if (err.message?.includes('authentication') || err.message?.includes('PAM')) {
        if (awsPool) { await awsPool.end().catch(() => {}); awsPool = null; }
      }
    });
  }
  return awsPool;
}

// ─── Tagged-template helper ───────────────────────────────────────────────────

function convertTemplateToQuery(
  queryParts: TemplateStringsArray,
  values: unknown[]
): { query: string; values: unknown[] } {
  let query = queryParts[0];
  for (let i = 0; i < values.length; i++) {
    query += `$${i + 1}${queryParts[i + 1]}`;
  }
  return { query, values };
}

async function runQuery(
  queryParts: TemplateStringsArray,
  values: unknown[]
): Promise<{ rows: any[]; rowCount: number | null }> {
  const { query, values: queryValues } = convertTemplateToQuery(queryParts, values);

  if (useVercelPostgres) {
    const pool = await getPgPool();
    const result = await pool.query(query, queryValues);
    return { rows: result.rows, rowCount: result.rowCount };
  }

  if (useAWSSigner) {
    let pool = await getAWSPool();
    if (!pool) throw new Error('Failed to create AWS RDS connection pool');
    try {
      const result = await pool.query(query, queryValues);
      return { rows: result.rows, rowCount: result.rowCount };
    } catch (error: any) {
      if (
        error.message?.includes('authentication') ||
        error.message?.includes('PAM') ||
        error.message?.includes('password')
      ) {
        if (awsPool) { await awsPool.end().catch(() => {}); awsPool = null; }
        signerInitialized = false; awsSigner = null;
        pool = await getAWSPool();
        if (!pool) throw new Error('Failed to create AWS RDS connection pool after retry');
        const result = await pool.query(query, queryValues);
        return { rows: result.rows, rowCount: result.rowCount };
      }
      throw error;
    }
  }

  throw new Error(
    'No database connection configured. ' +
    `DATABASE_URL: ${!!process.env.DATABASE_URL}, ` +
    `POSTGRES_URL: ${!!process.env.POSTGRES_URL}, ` +
    `AWS_ROLE_ARN: ${!!process.env.AWS_ROLE_ARN}.`
  );
}

/**
 * Tagged-template SQL helper.
 * @example await sql`SELECT * FROM bookings WHERE id = ${id}`
 */
export default function sql(
  queryParts: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: any[]; rowCount: number | null }> {
  return runQuery(queryParts, values);
}

export async function getConnection() {
  if (useVercelPostgres) {
    const pool = await getPgPool();
    return pool.connect();
  }
  if (useAWSSigner) {
    const pool = await getAWSPool();
    if (!pool) throw new Error('Failed to create AWS RDS connection pool');
    return pool.connect();
  }
  throw new Error('No database connection configured');
}
