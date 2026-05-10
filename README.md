# LiveCanvas - Collaborative Whiteboard & Diagramming Tool

LiveCanvas is a modern, high-performance collaborative whiteboard application designed specifically for engineering teams. It combines the flexibility of a freeform canvas with the power of structured AI generation to help teams visualize complex systems, document architecture, and brainstorm in real-time.

## 🚀 Key Features

- **Real-time Collaboration**: Work seamlessly with your team on a shared infinite canvas.
- **AI-Powered Architecture Generation**: Generate professional, brand-aware system diagrams from simple text prompts using Google Gemini.
- **Integrated Document Editor**: Create rich, structured documentation alongside your diagrams using Editor.js.
- **Engineering-First Component Library**: Pre-built elements for cloud architecture, UI flows, and logic diagrams.
- **Theme-Aware Design**: Fully supports light and dark modes with a sophisticated "Academic Curator" aesthetic.
- **Secure Workspace Management**: Organize your work into teams and private projects with Google Authentication.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn/UI
- **Real-time Engine**: Excalidraw, Convex
- **AI Engine**: Google Gemini (Generative AI)
- **Database**: Convex
- **Authentication**: Firebase / Better-Auth
- **Rich Text**: Editor.js

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Cloud Project (for Gemini API and Firebase)
- A Convex account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RAHUL-0568/liveCanvas-.git
   cd liveCanvas-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Convex
   CONVEX_DEPLOYMENT=your_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_convex_url

   # Google Gemini
   GEMINI_API_KEY=your_gemini_api_key

   # Firebase (Google Auth)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Better Auth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   BETTER_AUTH_SECRET=your_random_secret
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start collaborating.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
