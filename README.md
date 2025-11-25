# FounderFrame

FounderFrame is an AI-powered strategic assistant that helps entrepreneurs transform raw ideas into structured market insights and professional pitch decks.

## Features

- **🚀 Smart Ideation**: Transforms rough startup concepts into clear value propositions and strategic narratives.
- **📊 Strategic Market Analysis**: 
  - Instant estimation of TAM, SAM, and SOM.
  - Comprehensive SWOT analysis.
  - Competitor landscape and target audience breakdown.
- **slides Automated Pitch Deck Builder**: 
  - Generates a structured 10-slide investor deck.
  - Auto-writes professional copy and speaker notes.
  - Supports multiple layouts (Default, Image Left, Minimal, Content Heavy).
- **🎨 AI Visual Generation**: 
  - Creates custom, high-definition corporate illustrations for slides using Gemini 3 Pro Image.
  - "Corporate Memphis" style prompt engineering for consistent aesthetics.
- **✨ Customization**:
  - Real-time slide editing.
  - Multiple visual themes (Professional Blue, Eco Green, Bold Rose, etc.).
- **📤 Export & Present**:
  - Browser-based Presentation Mode.
  - High-quality PDF export.
  - Individual slide image download (PNG/JPG).

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (Gemini 3 Pro, Gemini 3 Pro Image)
- **Visualization**: Recharts
- **Export Tools**: jsPDF, html2canvas
- **Icons**: Lucide React
- **Build Tool**: Vite (Recommended for production)

## Setup

1. **Environment Variables**:
   Ensure you have a valid Google Gemini API Key.
   The app expects the key to be available via `process.env.API_KEY`.

2. **Dependencies**:
   The project uses standard React dependencies. Ensure `node_modules` are installed via `npm install`.

3. **Running**:
   Start the development server using `npm start` (or your preferred bundler command).

## Deployment

### Vercel (Production)

To deploy successfully to Vercel, follow these steps:

1. **Push your code** to a Git repository.
2. **Import project** into Vercel.
3. **Environment Variables**:
   - Go to **Settings** > **Environment Variables**.
   - Add a new variable:
     - **Key**: `API_KEY`
     - **Value**: `Your_Actual_Gemini_API_Key_Here` (starts with `AIza...`)

4. **Vite Configuration**:
   A `vite.config.ts` file is included in the project to ensure `API_KEY` is correctly exposed to your application. If you are using a different build system, ensure you configure it to replace `process.env.API_KEY` with the actual value during the build process.

## Usage Guide

1. **Landing Page**: Click "Start Building Now" or "Log In" to enter the app.
2. **Ideation**: Enter a description of your startup idea (min 10 chars). The more detail, the better the analysis.
3. **Strategy**: Review the AI-generated market insights. Use this data to validate your concept before building the deck.
4. **Pitch Builder**: 
   - Navigate slides using the sidebar.
   - Click "Generate Visual" on slides to create AI images.
   - Edit text, add bullet points, or change slide layouts using the toolbar.
   - Change the overall look using the Theme selector.
5. **Export**: 
   - Use "Present" for a full-screen experience.
   - Use "PDF" to generate a document for investors.
   - Use "Print" for handouts.

## License

MIT