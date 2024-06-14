# Stage 1: Build React App
FROM node:16 AS build-stage

WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json yarn.lock tailwind.config.js  ./

# Install dependencies
#RUN npm install
RUN yarn install

# Copy the necessary files and directories for the React application
COPY src ./src
COPY public ./public
# Build the React application
RUN npm run build

# Stage 2: Set up FastAPI server
FROM python:3.10-slim

WORKDIR /app

# Install required Python packages
COPY scraper/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built React application from the build-stage
COPY --from=build-stage /app/build ./frontend/build

# Copy the FastAPI application code
COPY scraper/ .

# Expose the port the app runs on
EXPOSE 8000

# Run the FastAPI server with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
