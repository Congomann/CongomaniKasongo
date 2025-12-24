# New Holland Financial Group - Backend API

Complete backend API for the New Holland Financial Group CRM system.

## Features

- ✅ **Authentication & Authorization** - JWT-based auth with role-based access control
- ✅ **User Management** - Admin, Manager, Advisor, Client roles
- ✅ **Lead Management** - Lead tracking, AI analysis, assignments
- ✅ **Client Management** - Policy tracking, renewals, commissions
- ✅ **Calendar & Events** - Event scheduling and reminders
- ✅ **Notifications** - Real-time notification system
- ✅ **Chat System** - Internal messaging between users
- ✅ **Carrier Management** - Carrier assignments and tracking
- ✅ **Resources** - Document sharing and collaboration
- ✅ **Testimonials** - Review management with approval workflow
- ✅ **Job Applications** - Career portal integration
- ✅ **Real Estate** - Property listings and escrow transactions
- ✅ **Securities** - Portfolio management, compliance docs, advisory fees
- ✅ **Accounting** - Chart of accounts, journal entries, expense tracking
- ✅ **Banking** - Bank account integration, transaction categorization

## Tech Stack

- **Node.js** + **Express** - Backend framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nhfg_crm"
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

3. **Initialize database:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with initial data
npx tsx prisma/seed.ts
```

4. **Start development server:**
```bash
npm run dev
```

Server will be running at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user (Admin)
- `POST /api/users/:id/restore` - Restore user (Admin)
- `DELETE /api/users/:id/permanent` - Permanent delete (Admin)

### Leads
- `GET /api/leads` - Get all leads (role-filtered)
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `POST /api/leads/bulk-assign` - Bulk assign leads (Admin/Manager)
- `POST /api/leads/:id/action` - Accept/decline lead (Advisor)
- `DELETE /api/leads/:id` - Delete lead (Admin)

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Calendar
- `GET /api/calendar` - Get user's events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/clear` - Clear read notifications

### Chat
- `GET /api/chat` - Get user's messages
- `POST /api/chat` - Send message
- `PUT /api/chat/:id/read` - Mark message as read

### Carriers
- `GET /api/carriers` - Get all carriers
- `POST /api/carriers` - Create carrier (Admin)
- `POST /api/carriers/assign` - Assign carriers to advisors (Admin)
- `GET /api/carriers/assignments/:advisorId` - Get advisor assignments

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (Admin)
- `PUT /api/resources/:id` - Update resource (Admin)
- `POST /api/resources/:id/like` - Like resource
- `POST /api/resources/:id/dislike` - Dislike resource
- `POST /api/resources/:id/share` - Share resource
- `POST /api/resources/:id/comment` - Add comment
- `DELETE /api/resources/:id` - Delete resource (Admin)

### Properties (Real Estate)
- `GET /api/properties/listings` - Get property listings
- `POST /api/properties/listings` - Create listing
- `PUT /api/properties/listings/:id` - Update listing
- `GET /api/properties/transactions` - Get escrow transactions
- `POST /api/properties/transactions` - Create transaction
- `PUT /api/properties/transactions/:id` - Update transaction

### Portfolios (Securities)
- `GET /api/portfolios` - Get client portfolios
- `POST /api/portfolios` - Create portfolio
- `PUT /api/portfolios/:id` - Update portfolio
- `GET /api/portfolios/compliance` - Get compliance docs
- `POST /api/portfolios/compliance` - Upload compliance doc
- `GET /api/portfolios/fees` - Get advisory fees
- `POST /api/portfolios/fees` - Create fee
- `PUT /api/portfolios/fees/:id` - Update fee

### Accounting
- `GET /api/accounting/accounts` - Get chart of accounts
- `POST /api/accounting/accounts` - Create account
- `PUT /api/accounting/accounts/:id` - Update account
- `GET /api/accounting/journal` - Get journal entries
- `POST /api/accounting/journal` - Create journal entry
- `GET /api/accounting/tax-config` - Get tax configs
- `POST /api/accounting/tax-config` - Create tax config
- `GET /api/accounting/expense-categories` - Get expense categories
- `POST /api/accounting/expense-categories` - Create category

### Banking
- `GET /api/banking/accounts` - Get bank accounts
- `POST /api/banking/accounts` - Connect bank account
- `PUT /api/banking/accounts/:id` - Update bank account
- `DELETE /api/banking/accounts/:id` - Disconnect account
- `GET /api/banking/transactions` - Get transactions
- `POST /api/banking/transactions` - Create transaction
- `PUT /api/banking/transactions/:id` - Update transaction
- `POST /api/banking/transactions/:id/reconcile` - Reconcile transaction
- `GET /api/banking/rules` - Get bank rules
- `POST /api/banking/rules` - Create rule
- `DELETE /api/banking/rules/:id` - Delete rule

## Authentication

All protected routes require a Bearer token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## Role-Based Access Control

- **ADMIN** - Full system access
- **MANAGER** - Manage advisors, assign leads, view all data
- **SUB_ADMIN** - Limited admin access
- **ADVISOR** - Manage own leads/clients, limited access
- **CLIENT** - View own data only

## Database Schema

The complete database schema is defined in `prisma/schema.prisma` with the following main models:

- User
- Lead
- Client
- CallbackRequest
- Commission
- CalendarEvent
- Notification
- ChatMessage
- Carrier & AdvisorAssignment
- Resource
- Testimonial
- JobApplication
- Application
- CompanySettings
- PropertyListing & EscrowTransaction
- ClientPortfolio, ComplianceDocument, AdvisoryFee
- Account, JournalEntry, JournalLine, TaxConfig
- BankAccount, BankTransaction, BankRule, ExpenseCategory

## Production Deployment

1. **Set production environment variables**
2. **Run migrations:**
```bash
npm run prisma:push
```
3. **Build the application:**
```bash
npm run build
```
4. **Start production server:**
```bash
npm start
```

## Default Login Credentials (After Seed)

- **Admin:** admin@nhfg.com / admin123
- **Advisor:** insurance@nhfg.com / advisor123

⚠️ **Change these credentials in production!**

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ for New Holland Financial Group
