# CampusConnect – Campus Lost and Found System

CampusConnect is a web application. Its main purpose is to help people in a campus community report lost items and return found items to their owners.

Losing something like a student ID, calculator, bag, or phone can be stressful. Usually, people ask friends, share a message in a group, or visit different places to look for it. CampusConnect brings these reports into one website, so it is easier to search for an item and contact the person who reported it through the claim process.


## What the website can do

A visitor can browse published lost and found reports, open an item to read its details, and search using keywords. Reports can also be filtered by type, category, and location. The newest reports appear first.

After creating an account and logging in, a user can:

- **Report a lost or found item.** Add a title, description, type, category, location, date, and an optional photo.
- **Manage their reports.** Open **Dashboard → My Reports** to see their own items, edit report details, or delete a report after confirming.
- **Claim an item.** Send a claim with a message and proof details for an eligible report posted by someone else.
- **Check claims.** See claims they submitted and claims received for their reported items. The report owner can approve or reject a pending claim.
- **See possible matches.** The system suggests related lost and found reports based on their details.
- **Use light or dark mode.** The website includes both themes.

There is also a separate **admin dashboard** for accounts with the admin role. It provides an overview of the system and tools to review reports and manage user-account status.

## How CampusConnect works

Here is a simple example:

1. A student loses a grey laptop pouch near the Engineering Faculty.
2. The student logs in and creates a **Lost Item** report.
3. Another student who found a similar pouch creates a **Found Item** report.
4. The website shows published reports and may suggest a possible match.
5. The owner can check the item details and submit a claim with information that helps identify the pouch.
6. The person who reported the item can review the claim and decide whether to approve it.

This does not mean every match is correct. The final decision still needs to be made by the people involved.

### Smart Matching

CampusConnect uses a **rule-based matching system**. It compares a lost report with found reports using the item category, location, title words, description words, and how close the reported dates are. It then gives each possible match a score.

This feature does **not** use a trained machine learning model. It is a simple scoring method to make searching easier.

## Technologies used

| Part | Technology | What it is used for |
| --- | --- | --- |
| Frontend | React and Vite | Pages, forms, dashboard, and user interaction |
| Navigation | React Router | Moving between pages without reloading the whole website |
| Styling | CSS | Layout, responsive design, light mode, and dark mode |
| Backend | Node.js and Express | REST API and application logic |
| Database | MongoDB with Mongoose | Storing users, item reports, and claims |
| Authentication | JWT and bcryptjs | Login tokens and password hashing |
| Image uploads | Multer | Uploading optional item photos |

### Application structure

```text
React frontend (browser)
        |
        | HTTP requests
        v
Node.js + Express API
        |
        | Mongoose
        v
     MongoDB
```

The frontend sends requests to the backend. The backend checks the request, performs the required work, and saves or reads data using MongoDB. Uploaded images are saved in the backend's local `uploads/` directory, while MongoDB stores the image URL.

## CRUD operations

A main requirement of EC4307 is full **Create, Read, Update, and Delete (CRUD)** functionality with persistent database storage. CampusConnect supports these operations for item reports.

| Operation | Where it happens | What it does |
| --- | --- | --- |
| **Create** | **Report Item** | Saves a new lost or found report in MongoDB |
| **Read** | **Browse Items**, **Item Details**, **My Reports** | Displays saved reports and their details |
| **Update** | **Dashboard → My Reports → Edit** | Changes an existing report and saves the changes |
| **Delete** | **Dashboard → My Reports → Delete** | Deletes a report after a confirmation popup |

A logged-in user can manage their own reports. The backend checks ownership before allowing an update or deletion (and also allows the admin role).

To check that the data is really saved, create a test report, refresh the page, edit it, refresh again, then delete it and refresh one more time. Use a **temporary report without any claims** for this test.

## Database overview

The project mainly uses three MongoDB collections:

- **User:** Stores account details such as name, email, student ID, faculty, hashed password, role, and account status.
- **Item:** Stores the item title, description, lost/found type, category, location, date, optional image URL, status, and the user who reported it.
- **Claim:** Stores a claim's related item, the person who submitted it, their message, proof details, and claim status.

The main relationships are:

- One **User** can report many **Items**.
- One **User** can submit many **Claims**.
- One **Item** can receive many **Claims**.

The `owner`, `claimant`, and `item` fields connect these records using MongoDB ObjectIds. Mongoose is used to define the fields and validation rules.

## Project folders

```text
Campus-Connect/
├── backend/
│   ├── config/           # Database connection
│   ├── controllers/      # Backend logic
│   ├── middleware/       # Login checks, admin checks, image upload
│   ├── models/           # User, Item, and Claim schemas
│   ├── routes/           # API routes
│   ├── tests/            # Backend tests
│   ├── uploads/          # Uploaded item photos (local)
│   └── server.js         # Backend entry point
├── frontend/
│   ├── public/           # Public assets
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Authentication and theme state
│       ├── pages/        # Website pages
│       └── services/     # Requests to the backend API
├── docs/
│   └── screenshots/      # Screenshots used in this README
└── README.md
```

## How to run the project on your computer

### What you need

- Node.js and npm
- MongoDB running locally **or** a working MongoDB Atlas database connection
- A code editor such as VS Code

### 1. Download the project

```bash
git clone https://github.com/malhar-ahmed/Campus-Connect.git
cd Campus-Connect
```

You can also download the project ZIP from GitHub and extract it.

### 2. Set up the backend

Open a terminal inside the `backend` folder and install the packages:

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` **if you do not already have a working `.env` file**. Fill in your own database connection and JWT secret:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_private_secret
JWT_EXPIRES_IN=7d
```

The `MONGO_URI` can point to a local MongoDB database or MongoDB Atlas. Do not upload your real `.env` file, passwords, or connection strings to GitHub.

Start the backend:

```bash
npm run dev
```

The API normally runs at `http://localhost:5000`.

### 3. Set up the frontend

Open a **second terminal** from the project folder:

```bash
cd frontend
npm install
```

If needed, copy `frontend/.env.example` to `frontend/.env` and use:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local address printed in the terminal (usually `http://localhost:5173`). Keep both the frontend and backend running while using the application.

### 4. Try the website

Register a user account, log in, and create a sample lost or found item. Then open **Browse Items** and **Dashboard → My Reports** to check that your report appears. You can also edit or delete that test report from your dashboard.

## API overview

Some of the main backend routes are:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in |
| `GET` | `/api/items` | Browse published reports |
| `GET` | `/api/items/:id` | View one published report |
| `POST` | `/api/items` | Create a report (login required) |
| `GET` | `/api/items/mine` | View your own reports (login required) |
| `PUT` | `/api/items/:id` | Update a report (owner or admin) |
| `DELETE` | `/api/items/:id` | Delete a report (owner or admin) |
| `GET` | `/api/items/:id/matches` | View suggested matches |
| `POST` | `/api/claims` | Submit a claim (login required) |
| `GET` | `/api/claims/mine` | View claims you submitted |
| `GET` | `/api/claims/received` | View claims on your reports |
| `PUT` | `/api/claims/:id/review` | Approve or reject a claim |

Admin routes are grouped under `/api/admin` and require an admin account.

## Validation and access control

To reduce incorrect data and unauthorized changes, the application includes basic validation and access checks:

- Important form fields are required.
- An item title must have **2–100 characters** and a description **10–1000 characters**.
- Item types and categories must be selected from allowed values.
- Uploaded photos must be JPG, JPEG, PNG, or WEBP, with a maximum size of **2 MB**.
- Users need to log in to report items or send claims.
- Users cannot claim their own reports, and the backend prevents duplicate claims for the same item from the same user.
- Only an item's owner or an admin can update or delete that item.
- User passwords are stored as hashes, not as plain text.

These checks support the mini-project requirements, but they should not be treated as a complete production security audit.

## Testing

The repository includes backend tests for authentication and item/claim access rules. To run them:

```bash
cd backend
npm test
```

To check the frontend:

```bash
cd frontend
npm run lint
npm run build
```

For manual testing, the most important flow is **Create → Read → Update → Delete**. Also check the form error messages, item searching, claim handling, mobile screen size, and both light and dark mode.


## About this project

CampusConnect was built as a practical web development project to learn how a frontend, backend, and database work together. The most useful part of building it was connecting forms and pages to real database operations, then testing that records could be created, viewed, updated, and deleted.

**Module:** EC4307 – Web Application Development  
**Project:** CampusConnect – Campus Lost and Found System  

