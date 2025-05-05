## Warehouse Management System

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
        "name": "Dining Chair",
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
  - Example response: `[{ "name": "Dining Chair", "contain_articles": [...] }]`

- **GET `/products/:productName/canBeMade`**:
  - Checks if a product can be made based on stock.
  - Example: `GET /products/Dining Chair/canBeMade` returns `{ true }`

- **POST `/products/:productName/create`**:
  - Creates a product and updates stock if possible.
  - Example: `POST /products/Dining Chair/create` returns `{ "Stock updated after creating: 'Dining Chair'" }` or an error.

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