# 🌍 Travel Assistant App

Een AI-powered travel planning assistant gebouwd met Next.js, OpenAI, en moderne web technologieën.

## Features

- 📄 **Document Upload**: Upload PDFs, images, of paste URLs
- 🤖 **AI Processing**: Extract travel information automatically
- 💬 **Travel Chat**: Chat met Globy, je AI travel buddy
- 🎯 **Smart Insights**: Get personalized travel recommendations

## Quick Start

1. **Clone het project**
\`\`\`bash
git clone [your-repo-url]
cd travel-assistant-app
\`\`\`

2. **Installeer dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Setup environment variables**
\`\`\`bash
cp .env.local.example .env.local
# Vul je OpenAI API key in
\`\`\`

4. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open http://localhost:3000**

## Deployment

This app is optimized for deployment on Vercel with automatic GitHub integration.

## Environment Variables

- `OPENAI_API_KEY` - Required voor AI features
- `ADOBE_PDF_CLIENT_ID` - Optional voor PDF processing
- `ADOBE_PDF_CLIENT_SECRET` - Optional voor PDF processing
- `UNSPLASH_ACCESS_KEY`: Unsplash API key for images (optional)

## Tech Stack

- **Framework**: Next.js 14
- **AI**: OpenAI GPT-4, AI SDK
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **TypeScript**: Full type safety
