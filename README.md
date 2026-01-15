# NateCon 2026

A community conference website for Nate Jones' AI newsletter readers, taking place March 14-15, 2026 in San Francisco.

## About

NateCon is a two-day community-driven conference featuring:

- **Day 1 (Saturday)**: Community talks, Nate's keynote, and speaker panels
  - Lightning talks (15 minutes)
  - Full talks (45 minutes)
  - Panel discussions with speakers

- **Day 2 (Sunday)**: "Nateathon" hackathon
  - Team-based AI project building
  - Prize categories: Best AI Agent, Best AI Tool, and Best Overall
  - 3-minute project demos

## Features

This web application provides:

- **Public Pages**: Event information, schedule, speakers, FAQs, and team browsing
- **Authentication**: User accounts with Supabase authentication
- **Talk Proposals**: Submit and manage lightning talk or full talk proposals
- **Team Management**: Create and join hackathon teams
- **Admin Dashboard**: Manage users, proposals, teams, and announcements
- **Countdown Timer**: Live countdown to the event
- **Social Sharing**: Built-in social media sharing capabilities

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Supabase (authentication, database)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation

## Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
