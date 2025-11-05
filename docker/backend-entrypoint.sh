#!/bin/sh
set -e

echo "🚀 Starting backend entrypoint script..."

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
/wait-for-it.sh postgres 5432

# Wait a bit more to ensure Postgres is fully ready
sleep 2

echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully!"
else
    echo "⚠️  Warning: Migrations failed, but continuing..."
fi

# Try to seed the database (but don't fail if it errors)
echo "🌱 Attempting to seed database..."
if npx tsx prisma/seed.ts; then
    echo "✅ Database seeded successfully!"
else
    echo "⚠️  Warning: Seeding failed or already complete, continuing..."
fi

# Start the development server
echo "🚀 Starting backend server..."
exec npm run dev
