# Files Manager

Files Manager is a back-end application that provides an API for managing files. This project includes user authentication, file uploads, file management, and background processing for image thumbnail generation.

## Features

- User Authentication (Sign-up, Sign-in, and Sign-out)
- File Management:
  - Upload, retrieve, publish, and unpublish files
  - Generate thumbnails for image files in multiple sizes (500px, 250px, 100px)
  - Serve files and their thumbnails
- Pagination support for file listing
- Real-time processing using Redis and Bull
- MongoDB for data storage

## Technologies Used

- **Node.js**: Back-end runtime
- **Express**: Framework for building APIs
- **MongoDB**: Database for storing user and file data
- **Redis**: In-memory data store for caching and queue management
- **Bull**: Queue library for background job processing
- **image-thumbnail**: Library for generating image thumbnails
- **Jest**: Testing framework
- **Supertest**: Library for endpoint testing

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- Redis (v5+)

### Installation

1. Clone the repository:
   ```bash
   git clone repo
   cd files-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file with the following variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=27017
   DB_DATABASE=files_manager
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Start the worker for thumbnail generation:
   ```bash
   npm run start-worker
   ```

### API Endpoints

#### Authentication
- `POST /users`: Create a new user
- `GET /connect`: Log in
- `GET /disconnect`: Log out

#### Files
- `POST /files`: Upload a new file
- `GET /files`: List files (supports pagination)
- `GET /files/:id`: Retrieve a file by ID
- `PUT /files/:id/publish`: Publish a file
- `PUT /files/:id/unpublish`: Unpublish a file
- `GET /files/:id/data`: Retrieve file data (with optional `size` query for thumbnails)

#### Status and Stats
- `GET /status`: Check Redis and database status
- `GET /stats`: Get statistics (number of users and files)

## Testing

Run tests with:
```bash
npm test
```

## Folder Structure

```
files-manager/
├── __tests__/       # Test files
├── controllers/     # Route handlers
├── routes/          # API route definitions
├── utils/           # Utility classes (e.g., Redis, DB clients)
├── workers/         # Background workers (e.g., Bull queue processors)
├── app.js           # Main application entry point
└── package.json     # Project metadata and dependencies
```
## Authors:
1. Francis G. Waihiga
2. Ademitidayo