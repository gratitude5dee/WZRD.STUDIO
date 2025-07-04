# WZRDFLOW

<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/75e227dd-f761-4608-8e6f-1be7791dd13a" alt="WZRDFLOW Logo" width="150">
  <h1>WZRDFLOW</h1>
  <p><strong>A Node-Based Generative AI Workflow Studio</strong></p>
  <p>Visually build, connect, and run complex AI pipelines for video and image creation. Powered by React, Supabase, and Fal.ai.</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/React_Flow-0A0A0A?style=for-the-badge&logo=reactflow&logoColor=white" alt="React Flow">
</p>

**WZRDFLOW** is a full-stack, open-source studio for creating generative AI content. It provides a visual, node-based canvas where you can chain together different AI models to create stunning images and videos. From initial concept to final video edit, WZRDFLOW provides a seamless, integrated experience.

## ✨ Features

-   **🤖 Node-Based AI Editor:** Visually connect AI models like Text-to-Image, Text-to-Text, and Images-to-Video using a powerful `ReactFlow` canvas.
-   **🔒 Secure Serverless Backend:** Built with **Supabase** for the database, user authentication, storage, and a suite of secure **Deno Edge Functions**.
-   **🚀 High-Performance AI:** Integrates with **Fal.ai** for fast, serverless inference, with all API keys securely managed on the backend.
-   **🎬 Full Creative Suite:**
    -   **Project Setup Wizard:** Guided flow to define your project's concept, style, and cast.
    -   **Storyboard View:** Plan your narrative shot-by-shot.
    -   **Video Editor:** A timeline-based editor to assemble your generated media.
-   **💎 Modern UI/UX:** A sleek, responsive interface built with **shadcn/ui**, **Tailwind CSS**, and **Framer Motion**.
-   **📦 State Management:** Robust client-side state with **Zustand** and efficient server-state synchronization with **TanStack Query**.

## 🏛️ Architecture

WZRDFLOW uses a modern, secure, and scalable serverless architecture. API keys are never exposed on the client-side.

```
┌─────────────────┐      ┌───────────────────────────┐      ┌────────────────┐
│ React Frontend  │      │   Supabase Edge Functions   │      │   Fal.ai API   │
│ (Vite, React)   ├─────►│  (Deno, Secure API Proxy)   ├─────►│  (ML Models) │
└─────────────────┘      └───────────────────────────┘      └────────────────┘
        ▲                        ▲               ▲
        │                        │               │
        └────────────────────────┴───────────────┘
              (Auth, Database, Storage)
               ┌─────────────────────┐
               │  Supabase Platform  │
               └─────────────────────┘
```

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Vite (with SWC), ReactFlow, TanStack Query, Zustand, Framer Motion
-   **UI:** Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
-   **Backend:** Supabase (PostgreSQL, Auth, Storage)
-   **Serverless Functions:** Deno (via Supabase Edge Functions)
-   **AI Inference:** Fal.ai

## ✅ Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
-   A package manager: `npm`, `yarn`, or `bun`
-   [Supabase CLI](https://supabase.com/docs/guides/cli)
-   A free [Supabase account](https://supabase.com/dashboard)
-   A [Fal.ai account](https://fal.ai/) and API Key

## 🚀 Quick Start & Installation

Follow these steps to get a local instance of WZRDFLOW running.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wzrdflow-87-main.git
cd wzrdflow-87-main
```

### 2. Set Up Supabase Project

1.  **Log in to Supabase CLI:**
    ```bash
    supabase login
    ```

2.  **Link your local repository to a new Supabase project:**
    ```bash
    supabase link --project-ref <YOUR_PROJECT_ID>
    ```
    You can get your `<YOUR_PROJECT_ID>` from your Supabase project's URL (`https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>`).

3.  **Create Environment Variables File:**
    Create a file named `.env.local` in the project root. Find your **Project URL** and **`anon` public key** in your Supabase project's API settings.

    **.env.local**
    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### 3. Set Up API Keys & Secrets

This project proxies requests to Fal.ai. You need to set your Fal API key as a secret in Supabase.

1.  **Get your Fal API Key:**
    -   Log in to [Fal.ai](https://fal.ai/).
    -   Navigate to the "Keys" section and copy your API key. It will look like `key_id:key_secret`.

2.  **Set the secret in Supabase:**
    ```bash
    supabase secrets set FAL_KEY="YOUR_FAL_API_KEY"
    ```

### 4. Deploy Supabase Functions & Database

1.  **Deploy Edge Functions:**
    The project includes several serverless functions. Deploy them to your Supabase project.
    ```bash
    supabase functions deploy --no-verify-jwt
    ```
    > The `--no-verify-jwt` flag is needed for some functions, while others manually verify the JWT.

2.  **Set Up Database Schema:**
    The project requires a specific database schema. You can create the tables by running the SQL script below in the **SQL Editor** in your Supabase dashboard.

    <details>
    <summary>Click to view the Database Setup SQL</summary>

    ```sql
    -- Create the projects table
    CREATE TABLE public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      title TEXT NOT NULL,
      description TEXT,
      aspect_ratio TEXT DEFAULT '16:9',
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- Create the workflows table
    CREATE TABLE public.workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to manage their own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- Create the nodes table
    CREATE TABLE public.nodes (
      id TEXT PRIMARY KEY,
      workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to manage nodes in their workflows" ON public.nodes FOR ALL USING (auth.uid() = (SELECT user_id FROM public.workflows WHERE id = workflow_id));

    -- Create the edges table
    CREATE TABLE public.edges (
      id TEXT PRIMARY KEY,
      workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
      source_node_id TEXT NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
      target_node_id TEXT NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to manage edges in their workflows" ON public.edges FOR ALL USING (auth.uid() = (SELECT user_id FROM public.workflows WHERE id = workflow_id));

    -- Create other necessary tables (media, credits, etc.)
    -- (This schema is inferred from the types and may need adjustment)
    CREATE TABLE public.media_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      duration REAL,
      start_time REAL,
      end_time REAL,
      status TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to manage media in their projects" ON public.media_items FOR ALL USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));
    ```
    </details>

### 5. Install Dependencies & Run

Finally, install the frontend dependencies and start the development server.

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

The application will be running at `http://localhost:8080`.

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, feature development, or documentation improvements, your help is appreciated.

1.  **Fork** the repository.
2.  Create a new branch for your feature: `git checkout -b feature/your-awesome-feature`.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your branch to your forked repository.
5.  Open a **Pull Request** to the `main` branch of this repository.

### Areas for Contribution

-   **Testing:** Implement a testing suite using Vitest and React Testing Library.
-   **New Nodes:** Add new nodes to the workflow editor for other AI models or utilities.
-   **Video Editor Enhancements:** Expand the features of the timeline-based video editor.
-   **Documentation:** Improve documentation for components, hooks, and services.

## 📜 License

This project is open-source. Please add a `LICENSE` file to the repository to specify the terms (e.g., MIT, Apache 2.0).


## Project info

**URL**: https://lovable.dev/projects/29af19e3-7b2e-4b5c-9184-1cf5b2783cbc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/29af19e3-7b2e-4b5c-9184-1cf5b2783cbc) and start prompting.
