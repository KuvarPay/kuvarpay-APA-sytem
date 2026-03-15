# Rayswap Database

This repository contains the Drizzle ORM schema and migration scripts for the Rayswap application.

## Local Development

### Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- `DATABASE_URL` environment variable set

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and update the `DATABASE_URL` with your actual database credentials:
   ```
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database"
   ```

### Database Operations

#### Generate Migrations

After making changes to the schema files in `src/db/schema/`, generate new migration files:

```bash
npm run db:gen
```

This will create SQL migration files in the `drizzle/migrations/` directory.

#### Apply Migrations

To apply pending migrations to your local database:

```bash
npm run db:migrate
```

This script uses PostgreSQL advisory locks to ensure safe concurrent execution.

## CI/CD Workflows

### Staging Migrations

The staging environment migrations run automatically on pushes to the `main` branch via the **Migrate Staging Database** workflow:

- **Trigger**: Automatic on push to main, or manual via workflow_dispatch
- **Secret**: `DATABASE_URL_STAGING` (optional - workflow skips gracefully if missing)
- **Safety**: Scans for destructive commands and skips if found (unless `ALLOW_DESTRUCTIVE` variable is true)
- **Behavior**: Non-failing - safe for forks and development environments

### Production Migrations

Production migrations require manual approval and run via the **Migrate Production Database** workflow:

- **Trigger**: Manual only via workflow_dispatch
- **Environment**: Requires `production` environment approval
- **Secret**: `DATABASE_URL_PROD` (required - workflow fails if missing)
- **Safety**: Scans for destructive commands and fails if found (unless `allow_destructive` input is true)
- **Input**: `allow_destructive` boolean parameter (default: false)

#### Running Production Migrations

1. Go to **Actions** → **Migrate Production Database**
2. Click **Run workflow**
3. Select the branch (usually `main`)
4. Set `allow_destructive` to `true` only if you need to run DROP, TRUNCATE, or ALTER TYPE commands
5. Click **Run workflow** and wait for environment approval

**⚠️ Warning**: Production migrations with destructive commands can cause irreversible data loss. Always review SQL files carefully before enabling `allow_destructive`.

## Production Deployment

**Important**: Only one CI job should run migrations in production environments to prevent conflicts. The migration script includes advisory locking for safety, but coordination at the deployment level is still required.

## Project Structure

- `src/db/schema/` - Database schema definitions
- `src/db/client.ts` - Database client configuration
- `scripts/migrate.ts` - Migration runner with advisory locking
- `drizzle/migrations/` - Generated SQL migration files
- `drizzle.config.ts` - Drizzle Kit configuration