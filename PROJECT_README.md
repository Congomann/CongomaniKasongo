# New Holland Financial Group - Full Stack CRM

Complete full-stack CRM application for financial advisors with separate frontend and backend.

## 📁 Project Structure

```
.
├── server/                 # Backend API (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth & error handling
│   │   └── server.ts      # Main server file
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeding
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md          # Backend documentation
│
├── [frontend files]       # React + TypeScript frontend
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── context/           # React context (currently mock data)
│   ├── services/          # API services
│   ├── types.ts           # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
└── PROJECT_README.md      # This file
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nhfg_crm"
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

4. **Initialize database:**
```bash
npm run prisma:generate
npm run prisma:push
npx tsx prisma/seed.ts
```

5. **Start backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to root directory:**
```bash
cd ..
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔗 Connecting Frontend to Backend

### Update Frontend to Use Real API

Currently the frontend uses mock data from `context/DataContext.tsx`. To connect to the real backend:

1. **Create API service layer** (example):

```typescript
// services/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // Leads
  getLeads: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createLead: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Add more API calls as needed...
};
```

2. **Update DataContext to use API:**

Replace mock data with real API calls in `context/DataContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  const { token, user } = await api.login(email, password);
  localStorage.setItem('token', token);
  setUser(user);
};

const fetchLeads = async () => {
  const token = localStorage.getItem('token');
  const leads = await api.getLeads(token);
  setLeads(leads);
};
```

3. **Handle authentication state:**

Store JWT token in localStorage and include it in all API requests.

## 🗄️ Database Schema

The backend uses PostgreSQL with Prisma ORM. Key models include:

- **User** - Admin, Manager, Advisor, Client roles
- **Lead** - Lead tracking with AI analysis
- **Client** - Policy and client management
- **Commission** - Commission tracking
- **CalendarEvent** - Event scheduling
- **Notification** - Notification system
- **ChatMessage** - Internal messaging
- **Carrier** - Insurance carrier management
- **Resource** - Document sharing
- **Testimonial** - Review management
- **PropertyListing** - Real estate properties
- **ClientPortfolio** - Investment portfolios
- **Account** - Chart of accounts
- **BankAccount** - Banking integration

See `server/prisma/schema.prisma` for complete schema.

## 🔐 Authentication & Authorization

### JWT-Based Authentication

- Login returns JWT token
- Token must be included in Authorization header: `Bearer <token>`
- Token expires in 7 days (configurable)

### Role-Based Access Control

- **ADMIN** - Full system access
- **MANAGER** - Manage advisors, assign leads
- **SUB_ADMIN** - Limited admin access
- **ADVISOR** - Manage own leads/clients
- **CLIENT** - View own data only

## 📝 Default Login Credentials

After running the seed script:

- **Admin:** admin@nhfg.com / admin123
- **Advisor:** insurance@nhfg.com / advisor123

⚠️ **Change these in production!**

## 🔌 API Endpoints

Full API documentation available in `server/API_DOCUMENTATION.md`

Key endpoints:
- `POST /api/auth/login` - Authentication
- `GET /api/leads` - Get leads (role-filtered)
- `POST /api/leads` - Create lead
- `GET /api/clients` - Get clients
- `GET /api/calendar` - Get events
- `GET /api/notifications` - Get notifications
- And many more...

## 🎨 Frontend Features

- **Dashboard** - Metrics and performance tracking
- **Lead Management** - Lead tracking with AI analysis
- **Client Portal** - Client management and policies
- **Calendar** - Event scheduling
- **Chat** - Internal messaging
- **Resources** - Document sharing
- **Admin Panel** - User and system management
- **Real Estate Module** - Property listings and escrow
- **Securities Module** - Portfolio and compliance management
- **Accounting Module** - Bookkeeping and reporting
- **Banking Module** - Transaction categorization

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Recharts for data visualization
- Lucide React for icons
- Tailwind CSS (via inline styles)

## 📦 Deployment

### Backend Deployment

1. Set production environment variables
2. Run database migrations: `npm run prisma:push`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend Deployment

1. Update API_BASE_URL to production backend
2. Build: `npm run build`
3. Deploy `dist/` folder to hosting service

### Recommended Hosting

- **Backend:** Railway, Render, Heroku, or DigitalOcean
- **Database:** Railway, Supabase, or managed PostgreSQL
- **Frontend:** Vercel, Netlify, or Cloudflare Pages

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev  # Starts with hot-reload
```

### Frontend Development
```bash
npm run dev  # Starts Vite dev server
```

### Database Management
```bash
cd server
npm run prisma:studio  # Opens Prisma Studio UI
```

## 📚 Additional Resources

- Backend README: `server/README.md`
- API Documentation: `server/API_DOCUMENTATION.md`
- Database Schema: `server/prisma/schema.prisma`
- TypeScript Types: `types.ts`

## 🤝 Contributing

1. Create a new branch for your feature
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Proprietary - New Holland Financial Group

---

## 🆘 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### CORS Errors
- Verify CORS_ORIGIN in backend `.env`
- Check frontend API URL configuration

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure token is included in requests

### Port Conflicts
- Backend default: 5000
- Frontend default: 5173
- Change in `.env` or `vite.config.ts` if needed

---

**Built with ❤️ for New Holland Financial Group**
