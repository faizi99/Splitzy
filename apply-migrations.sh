#!/bin/bash

# Apply Prisma migrations to Turso database
echo "Applying migrations to Turso database..."

export PATH="$HOME/.turso/bin:$PATH"

turso db shell splitzy < prisma/migrations/20260121174246_init/migration.sql

echo "Migrations applied successfully!"
echo "You can now use your app at https://splitzy-l4d8.vercel.app"
