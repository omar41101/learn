#!/bin/bash
# 🚀 FLAS Learning Platform - Quick Setup Script

echo "======================================"
echo "🚀 FLAS Learning Platform Setup"
echo "======================================"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
cd server
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Setup database
echo "🗄️  Step 2: Setting up database..."
npm run setup-db
if [ $? -eq 0 ]; then
    echo "✅ Database setup complete"
else
    echo "⚠️  Note: Database might already exist"
fi
echo ""

# Step 3: Seed exercises (IMPORTANT!)
echo "📚 Step 3: Adding exercises to database..."
npm run seed-exercises
if [ $? -eq 0 ]; then
    echo "✅ Exercises added successfully"
else
    echo "❌ Error adding exercises"
    exit 1
fi
echo ""

# Step 4: Start server
echo "🌐 Step 4: Starting server..."
echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Server starting on: http://localhost:3000"
echo "Exercise page: http://localhost:3000/exercise.html?level=1"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
