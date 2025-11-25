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
- **🔐 Secure Authentication**:
  - User accounts managed via **Firebase Authentication**.
  - User profiles stored in **Firebase Firestore**.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication & Database**: Firebase Authentication, Firebase Firestore
- **AI Integration**: Google GenAI SDK (Gemini 3 Pro, Gemini 3 Pro Image)
- **Visualization**: Recharts
- **Export Tools**: jsPDF, html2canvas
- **Icons**: Lucide React
- **Build Tool**: Vite (Recommended for production)

## Setup

1. **Firebase Project Setup**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Add a new web app to your Firebase project.
   - **Enable Authentication**: In your Firebase project, navigate to "Authentication" and enable "Email/Password" provider.
   - **Enable Firestore**: In your Firebase project, navigate to "Firestore Database" and create a database (start in test mode for quick setup, but learn to secure it later).
   - Copy your Firebase project configuration (from Project settings -> Your apps -> Web app).

2. **`config/firebaseConfig.ts`**:
   - Create a file `config/firebaseConfig.ts`.
   - Paste your Firebase project configuration into this file, replacing the placeholder values.
   ```typescript
   // config/firebaseConfig.ts
   const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   export default firebaseConfig;
   ```

3. **Firebase Security Rules (Firestore)**:
   - For a basic setup, you can use these rules in your Firestore database to allow authenticated users to read and write their own profiles in the `users` collection:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, create: if request.auth != null;
         allow update, delete: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   - **Important**: These are basic rules for development. For production, learn more about [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/overview).

4. **Gemini API Key**:
   Ensure you have a valid Google Gemini API Key. This is separate from the Firebase API Key.
   The app expects the Gemini key to be available via `process.env.API_KEY`.

5. **Dependencies**:
   The project uses standard React dependencies. Ensure `node_modules` are installed via `npm install`.

6. **Running**:
   Start the development server using `npm start` (or your preferred bundler command).

## Deployment

### Vercel (Production)

To deploy successfully to Vercel, follow these steps:

1. **Push your code** to a Git repository.
2. **Import project** into Vercel.
3. **Environment Variables**:
   - Go to your Project Settings on Vercel.
   - Click on **Environment Variables**.
   - Add a new variable for your Gemini API Key:
     - **Key**: `API_KEY`
     - **Value**: `Your_Actual_Gemini_API_Key_Here` (starts with `AIza...`)
   - **Firebase Configuration**: The `config/firebaseConfig.ts` file's content is embedded in the client bundle and does not need to be added as environment variables on Vercel. However, ensure it contains your correct Firebase project details.

4. **Vite Configuration**:
   A `vite.config.ts` file is included in the project to ensure `API_KEY` is correctly exposed to your application. If you are using a different build system, ensure you configure it to replace `process.env.API_KEY` with the actual value during the build process.

## Usage Guide

1. **Landing Page**: Click "Start Building Now" or "Log In" to enter the app. You'll be prompted to create an account or log in.
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