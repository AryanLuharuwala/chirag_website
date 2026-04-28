# Deploy: The Exclusive Rack → Azure Web App

## One-time setup

### 1. Create Vercel Postgres database
1. Go to [vercel.com/storage](https://vercel.com/storage) → Create Database → Postgres
2. Copy the connection strings from the "Quickstart" tab

### 2. Run database migrations
```bash
cp .env.example .env.local
# Fill in your POSTGRES_URL from Vercel dashboard
npm run db:push    # creates tables
npm run db:seed    # loads 12 products + admin user
```

### 3. Stripe setup
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys
2. Add a webhook endpoint: `https://your-app.azurewebsites.net/api/stripe/webhook`
   - Event: `checkout.session.completed`
   - Copy the webhook secret

### 4. Azure Web App
```bash
# Build the Docker image
docker build -t exclusive-rack .

# Tag and push to Azure Container Registry (or use GitHub Actions)
az acr login --name <your-registry>
docker tag exclusive-rack <your-registry>.azurecr.io/exclusive-rack:latest
docker push <your-registry>.azurecr.io/exclusive-rack:latest
```

### 5. Azure App Settings (Environment Variables)
Set these in Azure Portal → Your Web App → Configuration → Application Settings:

| Name | Value |
|------|-------|
| `POSTGRES_URL` | from Vercel dashboard |
| `POSTGRES_PRISMA_URL` | from Vercel dashboard |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.azurewebsites.net` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.azurewebsites.net` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `ADMIN_EMAIL` | Your admin email |

## Admin panel
Go to `https://your-app.azurewebsites.net/admin`
- Login with the admin email + password set during `db:seed`
- **Products** — visual editor: click any product, edit name/price/desc/color, drag silhouette position
- **Settings** — live color palette editor, site name, intro variant

## Local development
```bash
cp .env.example .env.local
npm run dev
```

## Route map
```
/                      Landing + marquee intro
/shop                  Shop grid (filter: ?cat=Women&color=sky)
/shop/[slug]           Product detail
/lookbook              Editorial chapter
/bag                   Cart
/checkout/success      Post-Stripe redirect
/account               Login / register / order history
/admin                 Dashboard
/admin/products        Visual product editor
/admin/settings        Theme & color palette editor
/admin/login           Admin sign-in
```
