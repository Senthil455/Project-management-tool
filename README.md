# Project Management Tool

A full-stack project management application inspired by issue trackers. It lets
teams organise work into **projects**, break it down into **issues** (tasks/bugs),
and move those issues across a kanban-style **board** (Backlog, To Do, In Progress,
Done).

## Features

- User authentication (register / login / logout) with JWT.
- Create and manage multiple projects.
- Create issues with title, description, type, priority, assignee and status.
- Kanban board and backlog views with drag-free status changes.
- Project settings and member management.
- Dashboard with project overview.

## Tech Stack

| Layer   | Technology                          |
|---------|-------------------------------------|
| Client  | React 18, Vite, plain CSS           |
| Server  | Node.js, Express, MongoDB (Mongoose)|
| Auth    | JSON Web Tokens (JWT)               |

## Project Structure

```
.
├── client/                # React + Vite frontend
│   └── src/
│       ├── api/           # API client helpers
│       ├── components/    # Reusable UI components
│       ├── context/       # React contexts (Auth, Store)
│       └── pages/         # Route pages (Board, Backlog, Dashboard...)
└── server/                # Express API
    └── src/
        ├── config/        # Database configuration
        ├── middleware/    # Auth & error handling
        ├── models/        # Mongoose models
        ├── routes/        # API routes
        └── utils/         # Shared helpers
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Installation

```bash
# install server dependencies
cd server
npm install

# install client dependencies
cd ../client
npm install
```

### Configuration

Create `server/.env` with the following variables:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/pmt
JWT_SECRET=change_me
```

### Running

```bash
# start the API (from /server)
npm run dev

# start the client (from /client)
npm run dev
```

The client runs on `http://localhost:5173` by default and proxies API requests
to the server.

### Seed Data

```bash
cd server
npm run seed
```

## API Reference

| Method | Endpoint                 | Description                  |
|--------|--------------------------|------------------------------|
| POST   | `/api/auth/register`     | Register a new user          |
| POST   | `/api/auth/login`        | Authenticate and get a token |
| GET    | `/api/projects`          | List projects                |
| POST   | `/api/projects`          | Create a project             |
| GET    | `/api/projects/:id`      | Get a project with issues    |
| POST   | `/api/issues`            | Create an issue              |
| PATCH  | `/api/issues/:id`        | Update an issue              |

> All `/api` routes except `auth/register` and `auth/login` require a
> `Authorization: Bearer <token>` header.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
