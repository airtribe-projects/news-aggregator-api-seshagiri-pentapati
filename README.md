# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js, Express.js, bcrypt, and JWT. Users can register, set their news preferences (categories, languages, countries), and fetch top headlines or search for articles via the GNews API. The API includes token-based authentication, input validation, in-memory caching, and read-article tracking.

## Features

- **User Authentication** -- Register and login with email/password. Passwords are hashed with bcrypt. Sessions are managed via signed JWTs.
- **News Preferences** -- Each user can customize preferred categories, languages, and countries. News results are filtered accordingly.
- **GNews Integration** -- Fetches top headlines and search results from the GNews API (https://gnews.io).
- **In-Memory Caching** -- API responses are cached for 15 minutes to reduce external API calls and improve response times.
- **Read-Article Tracking** -- Users can mark articles as read and retrieve their read history.
- **Input Validation** -- All request bodies are validated with Joi schemas. Invalid input returns clear 400 errors.
- **Global Error Handling** -- A centralized error handler returns consistent JSON error responses.

## Prerequisites

- Node.js 18 or later
- A GNews API key (free tier: 100 requests/day) -- sign up at https://gnews.io

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd news-aggregator-api

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your GNEWS_API_KEY and a strong JWT_SECRET
```

## Environment Variables

| Variable        | Description                   | Default                                    |
| --------------- | ----------------------------- | ------------------------------------------ |
| `PORT`          | Server port                   | `3000`                                     |
| `JWT_SECRET`    | Secret key for signing JWTs   | `default-secret-change-in-production`      |
| `JWT_EXPIRES_IN`| Token expiration duration     | `24h`                                      |
| `GNEWS_API_KEY` | Your GNews API key            | _(required for live news)_                 |

## Running the Server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

The server starts at `http://localhost:3000`. Confirm with the health endpoint:

```
GET /api/health  -->  { "success": true, "message": "Server is running." }
```

## API Endpoints

### Authentication (no token required)

| Method | Endpoint         | Body                              | Description                |
| ------ | ---------------- | --------------------------------- | -------------------------- |
| POST   | `/api/register`  | `{ email, password }`             | Register a new user        |
| POST   | `/api/login`     | `{ email, password }`             | Login and receive a JWT    |

### Preferences (token required)

| Method | Endpoint              | Body                                          | Description               |
| ------ | --------------------- | --------------------------------------------- | ------------------------- |
| GET    | `/api/preferences`    | --                                            | Get current preferences   |
| PUT    | `/api/preferences`    | `{ categories?, languages?, countries? }`     | Update preferences        |

**Valid categories:** `general`, `world`, `nation`, `business`, `technology`, `entertainment`, `sports`, `science`, `health`

### News (token required)

| Method | Endpoint                      | Description                                      |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/api/news`                   | Top headlines based on user preferences           |
| GET    | `/api/news/search/:keyword`   | Search articles by keyword                        |
| GET    | `/api/news/:id`               | Get a single article by encoded URL               |
| POST   | `/api/news/:id/read`          | Mark an article as read                           |
| GET    | `/api/news/read`              | List all articles the user has marked as read     |

> **Note:** The `:id` parameter is the URL-encoded article URL (e.g., `encodeURIComponent(article.url)`).

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <token>
```

## Running Tests

Tests use Jest and Supertest. The GNews API is mocked so no API key is needed to run tests.

```bash
npm run test
```

## Project Structure

```
src/
  index.js                 # Server entry point
  app.js                   # Express app factory
  config/index.js          # Environment configuration
  middleware/
    auth.js                # JWT verification middleware
    validate.js            # Joi validation middleware factory
    errorHandler.js        # Global error handler
  routes/
    auth.js                # /api/register, /api/login
    preferences.js         # /api/preferences
    news.js                # /api/news/*
  controllers/
    authController.js      # Auth request handlers
    preferencesController.js
    newsController.js
  services/
    userService.js         # User CRUD + bcrypt logic
    newsService.js         # GNews API integration + caching
  store/index.js           # In-memory data store
  utils/token.js           # JWT sign/verify helpers
tests/
  auth.test.js             # Authentication tests
  preferences.test.js      # Preferences tests
  news.test.js             # News endpoint tests
docs/
  DOCUMENTATION.md         # Detailed logic documentation
```

## License

MIT
