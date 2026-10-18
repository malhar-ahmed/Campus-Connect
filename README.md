# CampusConnect

CampusConnect is a campus lost and found website. Students can report lost or found items, browse reports and submit claims. Admins can manage users and reports.

The frontend uses React and Vite. The backend uses Node.js, Express and MongoDB.

## How to run

You need Node.js and a MongoDB database.

Set up `backend/.env` using `backend/.env.example`. Add your MongoDB connection string and JWT secret. If you already have a working `.env`, keep it.

Open a terminal in the main CampusConnect folder and start the backend:

```bash
cd backend
npm install
npm run dev
```

Open another terminal in the main CampusConnect folder and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the address shown in the frontend terminal. Keep both terminals running while using the website.
