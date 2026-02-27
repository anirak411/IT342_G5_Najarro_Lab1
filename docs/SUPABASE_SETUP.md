# Supabase + Render Setup (TradeOff)

## 1) Prepare Supabase database

1. Open Supabase SQL Editor.
2. Run `docs/sql/supabase-tradeoff-schema.sql`.

## 2) Deploy backend on Render (Web Service)

- Root directory: `backend`
- Build command: `./mvnw clean package -DskipTests`
- Start command: `java -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar`

Set environment variables in Render:

- `SPRING_DATASOURCE_URL=jdbc:postgresql://db.sxzdsgtjkfnzeedgbqhb.supabase.co:5432/postgres?sslmode=require`
- `SPRING_DATASOURCE_USERNAME=postgres`
- `SPRING_DATASOURCE_PASSWORD=<your-supabase-db-password>`
- `CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>`
- `CLOUDINARY_API_KEY=<your-cloudinary-api-key>`
- `CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>`

## 3) Deploy frontend on Render (Static Site)

- Root directory: `web`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

Set environment variable:

- `VITE_API_BASE_URL=https://<your-backend-service>.onrender.com`

Also add rewrite rule in Render Static Site:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

## 4) Security note

If credentials were shared in chat/screenshots, rotate:

- Supabase DB password
- Supabase API keys (if exposed)
- Cloudinary API secrets
