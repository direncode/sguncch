# Project Bold Policy Platform

> **First, Best, For All** — A unified, mobile-first, UNC-native digital hub implementing Devin Duncan's 2026-2027 Student Body President vision.

## Overview

The Project Bold Policy Platform is a comprehensive digital hub that:
- Tracks progress on all 40 policies across 8 departments
- Provides unified access to student resources (wellness, food, mentorship)
- Enables transparency through public accountability dashboards
- Integrates with UNC IT systems (Shibboleth SSO, Canvas LTI, ConnectCarolina)

## Values

- **Courage**: We lead fearlessly, even if the path forward is uncertain
- **Community**: We believe progress happens together
- **Accountability**: We follow through on our promises and lead with honesty
- **Equity**: We ensure every Tar Heel has the opportunity to thrive
- **Innovation**: We think creatively and act boldly to solve challenges

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Auth | SAML 2.0 (UNC Shibboleth), JWT |
| Cache | Redis |
| AI | OpenAI/Anthropic API (optional) |

## Project Structure

```
project-bold-platform/
├── packages/
│   ├── frontend/          # Next.js web application
│   ├── backend/           # Express API server
│   └── shared/            # Shared types and utilities
├── docker-compose.dev.yml # Local development setup
├── ARCHITECTURE.md        # Detailed system architecture
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for local services)

### Development Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run database migrations (when implemented)
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development servers
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

### Mock Authentication

In development mode, SAML authentication is mocked. Use these endpoints:

```bash
# List available mock users
GET http://localhost:4000/auth/mock-users

# Login as different roles
POST http://localhost:4000/auth/mock-login
Body: { "role": "student" }  # or "org_leader", "senator", "cabinet", "admin"
```

## Departments & Policies

| Department | Policies |
|------------|----------|
| Academic Affairs | Peer Mentorship, Midterm Check-Ins, STEM Centers, Dean's List, Gallup Strengths |
| Basic Needs | Farmers Markets, Food Security Hub, Plus Swipe, Grocery Shuttle, Off-Campus Education |
| Civic Engagement | Civic Award, Town Council, Day of Service, Service Portal, Civics Newsletter |
| DEI | Syllabi Resources, Cultural Council, Cultural Calendar, Cultural Fund |
| Wellness & Safety | CAPS Expansion, Safety Task Force, Plan B/Narcan, Event Safety, Canvas Button, Health Integration |
| Environmental | Sustain Week, Surplus Meals, Adopt-a-Space, Composting, Donation Shop |
| State & External | Heels on the Hill, Legislators Day, Alumni Network, Roundtables |
| Communications | Who is Carolina, Advisory Committee, Podcast, Spotlights, Accountability Dashboard |

## UNC Integration Paths

### Phase 1: Shibboleth SSO (MVP)
- SAML 2.0 Service Provider configuration
- Attribute mapping (PID, Onyen, email, affiliation)
- Mock mode for development

### Phase 2: Canvas LTI 1.3
- "Student Wellness" button in Canvas
- Deep linking for course content
- REST API integration for announcements

### Phase 3: ConnectCarolina
- Health appointment scheduling (placeholder)
- Calendar/iCal feed integration
- Requires ITS partnership escalation

## API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | `POST /auth/mock-login` | Mock login (dev only) |
| Auth | `POST /auth/saml/callback` | SAML ACS endpoint |
| Departments | `GET /api/v1/departments` | List all departments |
| Policies | `GET /api/v1/policies` | List/filter policies |
| Wellness | `GET /api/v1/wellness/resources` | Wellness resources |
| Academic | `POST /api/v1/academic/mentorship/request` | Submit mentorship request |
| Civic | `POST /api/v1/civic/service-hours` | Log service hours |
| Metrics | `GET /api/v1/communications/metrics` | Accountability metrics |

## Contributing

This is an open-source project for UNC Student Government. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security & Compliance

- **FERPA**: Student data encrypted, role-based access, audit logging
- **HIPAA**: Separate handling for health data, no PHI storage without consent
- **WCAG 2.1 AA**: Accessible design with semantic HTML and ARIA labels
- **HTTPS**: TLS 1.3 enforced, JWT token rotation

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Together, We Go Bold.**

*Building a Carolina that is First, Best, and For All.*
