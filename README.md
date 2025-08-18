## Warehouse Management System

A full-stack web application for warehouse management with authentication and authorization.

## Features

- **Authentication & Authorization**: JWT-based auth with admin/user roles
- **Product Management**: View products, check if they can be made, create products (admin only)
- **Inventory Management**: View current stock levels of articles
- **REST API**: Complete API with Swagger documentation
- **Frontend**: React TypeScript application with responsive design

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Swagger/OpenAPI documentation
- Docker support

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd warehouse-management
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Start Database

```bash
# Start PostgreSQL database with Docker Compose
docker-compose up -d
```

### 4. Run the Application

#### Backend (Required - Run First)
```bash
# Clean build and start backend server
npm run build
npm run dev
```

The backend will be available at:
- **API Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs

#### Frontend (Run in separate terminal)
```bash
# Navigate to frontend directory and start React app
cd frontend
npm install
npm start
```

The frontend will be available at:
- **React App**: http://localhost:3001

#### Full Stack Quick Start Commands
```bash
# Terminal 1: Start database and backend
docker-compose up -d
npm run build
npm run dev

# Terminal 2: Start frontend (in new terminal)
cd frontend
npm start
```

## Access Points

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api-docs

## Default Accounts

The database comes pre-populated with demo accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Permissions**: Full access (can create products)

### User Account
- **Username**: `user`
- **Password**: `user123`
- **Permissions**: Read-only access

## API Documentation

Visit http://localhost:3000/api-docs after starting the backend to explore the API with Swagger UI.

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

You can get a token by:
1. Using the `/auth/login` endpoint
2. Using the "Authorize" button in Swagger UI
3. Logging in through the frontend application

### Key Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `GET /products` - List all products
- `GET /products/{name}/canBeMade` - Check if product can be made
- `POST /products/{name}/create` - Create product (admin only)
- `GET /articles` - List all articles

## Database Schema

The PostgreSQL database includes:

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `role` - User role (admin/user)
- `created_at` - Account creation timestamp

## Project Structure

```
warehouse-management/
├── src/                     # Backend source code
│   ├── database/           # Database connection and services
│   ├── middleware/         # Auth middleware
│   ├── models/            # Data models/interfaces
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── server.ts          # Main server file
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React context providers
│   │   └── services/      # API service layer
├── tests/                 # Test files
├── docker-compose.yml     # Docker services configuration
├── init.sql              # Database initialization script
└── README.md             # This file
```

## Development

### Environment Variables

#### Backend (.env)
```
PORT=3000
DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
INVENTORY_FILE=./inventory.json
PRODUCTS_FILE=./products.json
```

#### Frontend (frontend/.env)
```
PORT=3001
REACT_APP_API_URL=http://localhost:3000
```

### Database Management

```bash
# Start only database
docker-compose up postgres -d

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U warehouse_user -d warehouse_db

# Stop database
docker-compose down
```

### Building for Production

```bash
# Build backend
npm run build

# Build frontend
cd frontend
npm run build
```

## Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend
npm test
```

## Troubleshooting

### Clean Build and Restart
If you encounter issues, try a clean build:

```bash
# Clean backend build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build

# Clean frontend build
cd frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
cd ..
```

### Database Connection Issues
1. Ensure Docker is running
2. Check if PostgreSQL container is running: `docker-compose ps`
3. Verify environment variables in `.env`
4. Restart database: `docker-compose down && docker-compose up -d`

### Frontend Won't Start
1. Make sure you're in the frontend directory: `cd frontend`
2. Reinstall dependencies: `npm install`
3. Check if port 3001 is available
4. Try: `npm start`

### Backend Issues
1. Ensure database is running first: `docker-compose up -d`
2. Build TypeScript: `npm run build`
3. Check environment variables in `.env`
4. Start with: `npm run dev`

### CORS Issues
- The backend is configured to allow all origins in development
- For production, update CORS settings in `src/server.ts`

### Authentication Issues
- Check JWT_SECRET in environment variables
- Verify token expiration (default: 24h)
- Clear browser local storage if needed

## License

MIT License

This is a Node.js and TypeScript-based application designed to manage a warehouse's inventory and products. The `WarehouseService` class provides core functionalities to load articles and products from JSON files, check product availability based on stock levels, and update stock when products are created. The project includes a RESTful API built with Express, Swagger documentation, and support for Docker and MongoDB integration.

### Features

- **Load Articles and Products**: Load inventory and product data from JSON files or a MongoDB database.
- **Check Product Feasibility**: Determine if a product can be created based on current stock levels.
- **Update Stock**: Deduct required stock when a product is created.
- **RESTful API**: Access warehouse data and operations via HTTP endpoints (e.g., `/products`, `/articles`).
- **Swagger Documentation**: Auto-generated API documentation available at `/api-docs`.
- **Docker Support**: Run the application in a containerized environment.
- **Unit Testing**: Test the `WarehouseService` functionality with Jest.

### Prerequisites

- **Node.js**: Version 22 or later (recommended).
- **npm**: Version 10 or later (included with Node.js).
- **Docker**: For running the application in a container (optional).
- **MongoDB**: For database integration (optional, requires setup).

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/arashzjahangiri/warehouse-management.git
cd warehouse-management
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Set Up Environment Variables
Create a `.env` file in the root directory with the following content, adjusting values as needed:
```
PORT=3000
INVENTORY_FILE=./inventory.json
PRODUCTS_FILE=./products.json
MONGO_URI=mongodb://admin:secret@localhost:27017/warehouse?authSource=admin
```
- `PORT`: The port for the Express server (default: 3000).
- `INVENTORY_FILE`: Path to the inventory JSON file (default: `./inventory.json`).
- `PRODUCTS_FILE`: Path to the products JSON file (default: `./products.json`).
- `MONGO_URI`: MongoDB connection string (optional, uncomment `connectDB()` in `server.ts` to use).

#### 4. Compile TypeScript
```bash
npm run build
```

### Running the Project

#### Option 1: Run Locally
1. Start the application in development mode:
   ```bash
   npm run dev
   ```
   - This uses `ts-node` to run `src/server.ts` and enables hot reloading with changes.

2. Alternatively, run the compiled version:
   ```bash
   npm start
   ```
   - This runs `dist/index.js` after building the project.

3. Access the API:
   - Open your browser or use a tool like Postman to visit `http://localhost:3000/products` or `http://localhost:3000/articles`.
   - View Swagger documentation at `http://localhost:3000/api-docs`.

#### Option 2: Run with Docker
1. Build the Docker image:
   ```bash
   docker-compose build
   ```

2. Start the container:
   ```bash
   docker-compose up
   ```
   - The application will run on `http://localhost:3000`.

3. Stop the container:
   ```bash
   docker-compose down
   ```

#### Option 3: Debug Mode
1. Run in debug mode to inspect the application:
   ```bash
   npm run debug
   ```
   - Use a debugger (e.g., Chrome DevTools) to attach to the process.

### Usage

#### Loading Data
The application loads data from `inventory.json` and `products.json` by default. These files define the warehouse's articles and products.

- **Example `inventory.json`**:
  ```json
  {
    "inventory": [
      { "art_id": "1", "name": "leg", "stock": "12" },
      { "art_id": "2", "name": "screw", "stock": "17" },
      { "art_id": "3", "name": "seat", "stock": "2" },
      { "art_id": "4", "name": "table top", "stock": "1" }
    ]
  }
  ```

- **Example `products.json`**:
  ```json
  {
    "products": [
      {
        "name": "Dinning Chair",
        "contain_articles": [
          { "art_id": "1", "amount_of": "4" },
          { "art_id": "2", "amount_of": "8" },
          { "art_id": "3", "amount_of": "1" }
        ]
      },
      {
        "name": "Dinning Table",
        "contain_articles": [
          { "art_id": "1", "amount_of": "4" },
          { "art_id": "2", "amount_of": "8" },
          { "art_id": "4", "amount_of": "1" }
        ]
      }
    ]
  }
  ```

#### API Endpoints
The API is documented with Swagger. Key endpoints include:

- **GET `/articles`**:
  - Returns a list of all articles.
  - Example response: `[{ "art_id": "1", "name": "leg", "stock": 12 }]`

- **GET `/products`**:
  - Returns a list of all products.
  - Example response: `[{ "name": "Dinning Chair", "contain_articles": [...] }]`

- **GET `/products/:productName/canBeMade`**:
  - Checks if a product can be made based on stock.
  - Example: `GET /products/Dinning Chair/canBeMade` returns `{ true }`

- **POST `/products/:productName/create`**:
  - Creates a product and updates stock if possible.
  - Example: `POST /products/Dinning Chair/create` returns `{ "Stock updated after creating: 'Dinning Chair'" }` or an error.

### Testing

Run unit tests to verify the `WarehouseService` functionality:
```bash
npm test
```
- Tests are located in the `tests` directory and use Jest with the `ts-jest` preset.

### Project Structure

The project is organized as follows:

- `src/`: Contains the main source code.
  - `models/`: TypeScript interfaces for `Article` and `Product`.
  - `routes/`: Express routers for `/articles` and `/products`.
  - `services/`: `WarehouseService` class logic.
  - `index.ts`: Initial data loading and product creation example.
  - `server.ts`: Express server setup.
  - `swaggerConfig.ts`: Swagger documentation configuration.
- `tests/`: Unit tests for the service.
- `.env`: Environment variables.
- `docker-compose.yaml`: Docker configuration.
- `Dockerfile`: Container build instructions.
- `inventory.json`: Sample article data.
- `products.json`: Sample product data.

### Project Architecture (Mermaid Chart)

Below is a visual representation of the project’s architecture using Mermaid:

:::mermaid
graph TD
    A[Warehouse Management App] --> B[Express Server]
    B --> C[Product Routes]
    B --> D[Article Routes]
    B --> E[Swagger Docs]
    C --> F[WarehouseService]
    D --> F
    F --> G[Article Model]
    F --> H[Product Model]
    F --> I[Inventory JSON]
    F --> J[Products JSON]
    E --> K[/api-docs Endpoint]
    B --> L[MongoDB<br>(Optional)]
    L --> M[connectDB Function]
:::

#### Explanation of the Chart
- The `Express Server` handles HTTP requests and routes them to `Product Routes` and `Article Routes`.
- Both routes depend on `WarehouseService`, which uses `Article Model` and `Product Model` interfaces.
- Data is loaded from `Inventory JSON` and `Products JSON` files.
- `Swagger Docs` provides API documentation via the `/api-docs` endpoint.
- Optional MongoDB integration is supported through the `connectDB` function.

### Contributing

Feel free to submit issues or pull requests. Please follow the existing code style and add tests for new features.

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.