#!/bin/bash

# Create the SQLite database directory if it doesn't exist
mkdir -p prisma

# Run Prisma migrations
npx prisma generate
npx prisma migrate deploy

# Build the Next.js application
next build
