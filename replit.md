# JGL Management Platform

## Overview
This platform is a comprehensive web solution for the Jewish Gymnastics League (JGL), an inter-gymnastics league across 8+ cities. It aims to streamline membership, event registration, and competition management while integrating gamification features. The system supports a dual membership structure (gym and individual gymnast) and provides role-based dashboards for administrators, gym owners, coaches, and gymnasts. The goal is to provide a central online hub for gyms to join, manage athletes, and register for events, and for athletes/families to track events, register, and engage in challenges. Coaches gain tools for team oversight, and league administrators can efficiently handle memberships, events, ticketing, and communications. The system will enable targeted emails, ticket sales, and engagement tracking through a gamified member area, all while maintaining Jewish values and athletic excellence.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend
*   **Framework:** React with TypeScript, using Vite.
*   **Styling:** TailwindCSS with `shadcn/ui` for consistent design.
*   **State Management:** TanStack Query (React Query) for server state.
*   **Routing:** Wouter for client-side routing.
*   **Theme:** Custom JGL brand colors (magenta/pink and teal) with dark mode support.

### Backend
*   **Runtime:** Node.js with Express.js.
*   **Language:** TypeScript across the stack.
*   **Authentication:** Replit Auth with OpenID Connect.
*   **Session Management:** Express sessions with PostgreSQL storage.
*   **API Design:** RESTful API with role-based access control.

### Database
*   **Database:** PostgreSQL with Neon serverless hosting.
*   **ORM:** Drizzle ORM for type-safe queries.
*   **Schema Management:** Drizzle Kit for migrations.
*   **Data Integrity:** Email uniqueness constraints for gym admin and user accounts.

### Core Features & Design Patterns
*   **User Management:** Role-based permissions (admin, gym\_admin, coach, gymnast, spectator).
*   **Gym Management:** Approval workflows and payment tracking.
*   **Gymnast Management:** Coach approval for registration.
*   **Event Management:** Sessions and registration management, including spectator ticketing with limits.
*   **Gamification:** Challenges, rewards, score tracking, and leaderboards.
*   **Authentication & Authorization:** Replit Auth with OIDC, PostgreSQL-backed sessions, HTTP-only cookies, CSRF protection, secure session management, and enforced email uniqueness.
*   **Payment Processing:** Stripe integration for subscriptions and one-time payments, PCI-compliant handling.
*   **File Storage:** Google Cloud Storage for media assets (logos, images, documents) with enhanced upload experience via Uppy.js.
*   **Score Tracking:** Import gymnast scores post-event, track individual progress, and flag gymnasts who "score out" of a level based on JGL-specific rules.
*   **Email Communications:** Bulk and targeted email campaigns with custom graphics and automated triggers (confirmations, approvals, reminders).
*   **Coach Dashboard:** Real-time gymnast lists, editing/updating athlete info, approval flows for registrations, event oversight, and gamified area tracking.
*   **Gym/Club Administrator Dashboard:** All coach dashboard functions, membership history, interactive hosting dashboards, and access to JGL documents. Ability to input event details for league admin approval, and view estimated gymnast attendance.
*   **Gamified Member Area:** Skill-based challenges (league/coach-published), point system, redeemable prizes via a store, and multi-level leaderboards (individual, team, overall).
*   **League Admin Controls & Reporting:** Full user management, data export (membership, registration, ticketing, engagement), reporting dashboards, and system-wide configuration control. Automated reminder setting.

## External Dependencies
*   **Neon Database:** Serverless PostgreSQL hosting.
*   **Replit Auth:** Authentication and user management.
*   **Stripe:** Payment processing.
*   **Google Cloud Storage:** File storage and content delivery.
*   **shadcn/ui:** Pre-built component library.
*   **TailwindCSS:** Utility-first CSS framework.
*   **TanStack Query:** Server state synchronization and caching.
*   **React Hook Form:** Form validation and management.
*   **Zod:** Schema validation for type safety.
*   **Vite:** Build tool and development server.
*   **TypeScript:** Static type checking.
*   **ESBuild:** Fast JavaScript bundler.
*   **Drizzle Kit:** Database schema management and migrations.
*   **Uppy:** File upload handling.
*   **Font Awesome:** Icon library.
*   **Wouter:** Lightweight routing solution.
*   **Memoizee:** Function memoization.