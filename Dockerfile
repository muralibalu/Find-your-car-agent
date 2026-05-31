# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim
WORKDIR /app/backend

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy dataset (one level up, matches seed.py path)
COPY car_dataset_india.csv /app/car_dataset_india.csv

# Copy built React app (main.py serves this)
COPY --from=frontend-build /frontend/dist /app/frontend/dist

# Seed the database on build
RUN python seed.py

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
