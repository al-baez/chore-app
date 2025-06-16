#!/bin/bash

echo "🚀 Setting up Household Chore Scoring System for Production"
echo "==========================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOL
    echo "✅ Created .env.local - Please add your Supabase URL and anon key"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Set up your Supabase project at https://supabase.com"
echo "2. Run the SQL schema from supabase-schema.sql in your Supabase SQL editor"
echo "3. Update .env.local with your actual Supabase URL and anon key"
echo "4. Test locally: npm run dev"
echo "5. Deploy to Vercel: Follow the DEPLOYMENT.md guide"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Setup complete! Happy chore tracking!" 