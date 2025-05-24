# DSB Mobile Frontend

This is a Next.js frontend for the DSB Mobile substitution schedule application.

## Development

First, install dependencies:

```bash
bun install
```

Create a `.env.local` file with your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL.

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

### Prerequisites

- Docker
- Docker Compose

### Building and Running with Docker

1. Update the API URL in `docker-compose.yml` for both build-time and runtime:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=https://your-actual-api-url.com  # Build-time environment variable
    environment:
      - NEXT_PUBLIC_API_URL=https://your-actual-api-url.com    # Runtime environment variable
```

2. Build and start the containers:

```bash
docker-compose up -d
```

This will:
- Build the Docker image based on the Dockerfile
- Start the container with the specified environment variables
- Make the application available on port 3000

3. To stop the containers:

```bash
docker-compose down
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API |

## Features

- Display of substitution schedules
- User authentication
- Course selection with persistent preferences
- Mobile-responsive design

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!