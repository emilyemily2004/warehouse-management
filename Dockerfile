# Use official Node.js image as the base
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY *.json ./

# Install dependencies
RUN npm install

# Copy the rest of application code
COPY . .

# Expose the port app is running on (adjust if needed)
EXPOSE 3000

# Build the TypeScript files (if you're not running `ts-node` directly in dev)
RUN npm run build

# Start the app
#CMD ["npm", "start"]
CMD ["npm", "run", "dev"]