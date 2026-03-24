#!/bin/bash

# Quick Setup Script for FLAS Learning Platform

echo "🚀 FLAS Learning Platform - Quick Setup"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your MySQL credentials."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "The server will automatically initialize database levels on startup."
echo "If you want to manually set up the database, run:"
echo "  npm run setup-db"
