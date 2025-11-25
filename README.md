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

## Setup

1. **Environment Variables**:
   Ensure you have a valid Google Gemini API Key.
   Set `API_KEY` in your environment variables.

2. **Dependencies**:
   The project uses standard React dependencies. Ensure `node_modules` are installed via `npm install`.

3. **Running**:
   Start the development server using `npm start` (or your preferred bundler command).

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
