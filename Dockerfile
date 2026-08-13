# CI/CD with GitHub Actions
# ---------- Step 1: Build Frontend ----------
FROM node:20 AS frontend-build

WORKDIR /app/client

COPY ./client/package*.json ./
RUN npm install

COPY ./client/ .
RUN npm run build

# ---------- Step 2: Setup Backend ----------
FROM node:20

WORKDIR /app

# Copy server files
COPY ./server/package*.json ./server/
RUN cd server && npm install --production
COPY ./server ./server

# Copy frontend build output to backend static folder
COPY --from=frontend-build /app/client/dist /app/server/dist

WORKDIR /app/server

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]