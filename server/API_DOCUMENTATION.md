# API Documentation - NHFG CRM Backend

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "ADVISOR",
  "category": "INSURANCE"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADVISOR",
    "category": "INSURANCE"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nhfg.com",
  "password": "admin123"
}
```

**Response:** Same as register

---

## Users

### Get All Users (Admin/Manager)
```http
GET /users
Authorization: Bearer <token>
```

### Get Single User
```http
GET /users/:id
Authorization: Bearer <token>
```

### Create User (Admin)
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newadvisor@nhfg.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "ADVISOR",
  "category": "REAL_ESTATE",
  "productsSold": ["Real Estate", "Mortgage"],
  "languages": ["English", "Spanish"],
  "phone": "(555) 123-4567",
  "bio": "Experienced real estate advisor",
  "license_states": ["IA", "NE"],
  "micrositeEnabled": true
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "(555) 999-8888",
  "bio": "Updated bio"
}
```

### Soft Delete User (Admin)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Restore User (Admin)
```http
POST /users/:id/restore
Authorization: Bearer <token>
```

---

## Leads

### Get All Leads
```http
GET /leads
Authorization: Bearer <token>
```
*Note: Advisors only see their assigned leads*

### Create Lead
```http
POST /leads
Content-Type: application/json

{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phone": "555-0102",
  "interest": "Life Insurance",
  "message": "Looking for term life coverage",
  "assignedTo": "advisor-uuid",
  "priority": "High",
  "lifeDetails": {
    "dob": "1980-05-15",
    "city": "Des Moines",
    "state": "IA",
    "smokerStatus": "Non-Smoker"
  }
}
```

### Update Lead
```http
PUT /leads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONTACTED",
  "notes": "Client is interested in $500k term life policy"
}
```

### Bulk Assign Leads (Admin/Manager)
```http
POST /leads/bulk-assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadIds": ["lead-uuid-1", "lead-uuid-2"],
  "advisorId": "advisor-uuid",
  "priority": "High",
  "notes": "Priority leads from website"
}
```

### Accept/Decline Lead (Advisor)
```http
POST /leads/:id/action
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "accept",
  "reason": "Good fit for my portfolio"
}
```

---

## Clients

### Get All Clients
```http
GET /clients
Authorization: Bearer <token>
```

### Create Client
```http
POST /clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah Williams",
  "email": "sarah@example.com",
  "phone": "(555) 234-5678",
  "policyNumber": "POL-98765",
  "premium": 2400,
  "product": "Indexed Universal Life (IUL)",
  "renewalDate": "2025-06-15",
  "carrier": "Prudential",
  "advisorId": "advisor-uuid"
}
```

### Update Client
```http
PUT /clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "premium": 2600,
  "renewalDate": "2026-06-15"
}
```

---

## Calendar

### Get Events
```http
GET /calendar
Authorization: Bearer <token>
```

### Create Event
```http
POST /calendar
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Client Meeting - John Doe",
  "date": "2024-03-15T14:00:00Z",
  "time": "2:00 PM",
  "type": "meeting",
  "description": "Discuss policy renewal",
  "hasGoogleMeet": true
}
```

### Update Event
```http
PUT /calendar/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Meeting Title",
  "date": "2024-03-16T14:00:00Z"
}
```

### Delete Event
```http
DELETE /calendar/:id
Authorization: Bearer <token>
```

---

## Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Clear Read Notifications
```http
DELETE /notifications/clear
Authorization: Bearer <token>
```

---

## Chat

### Get Messages
```http
GET /chat
Authorization: Bearer <token>
```

### Send Message
```http
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-uuid",
  "text": "Hello, can we discuss the new lead?",
  "attachment": {
    "type": "file",
    "url": "https://example.com/document.pdf",
    "name": "Policy Document.pdf"
  }
}
```

---

## Carriers

### Get All Carriers
```http
GET /carriers
Authorization: Bearer <token>
```

### Assign Carriers (Admin)
```http
POST /carriers/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "advisorIds": ["advisor-uuid-1", "advisor-uuid-2"],
  "carrierIds": ["carrier-uuid-1", "carrier-uuid-2"],
  "assignedBy": "Admin Name"
}
```

### Get Advisor Assignments
```http
GET /carriers/assignments/:advisorId
Authorization: Bearer <token>
```

---

## Resources

### Get All Resources
```http
GET /resources
```

### Create Resource (Admin)
```http
POST /resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "2024 Market Outlook Report",
  "type": "PDF",
  "url": "https://example.com/report.pdf",
  "description": "Comprehensive market analysis for 2024",
  "author": "John Expert",
  "tags": ["market", "analysis", "2024"]
}
```

### Like Resource
```http
POST /resources/:id/like
Authorization: Bearer <token>
```

### Add Comment
```http
POST /resources/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "user": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "text": "Great resource! Very helpful."
}
```

---

## Properties (Real Estate)

### Get Property Listings
```http
GET /properties/listings
Authorization: Bearer <token>
```

### Create Listing
```http
POST /properties/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "123 Main Street",
  "city": "Des Moines",
  "state": "IA",
  "zip": "50309",
  "price": 350000,
  "type": "Residential",
  "status": "Active",
  "bedrooms": 3,
  "bathrooms": 2.5,
  "sqft": 2200,
  "image": "https://example.com/property.jpg",
  "sellerName": "Jane Smith"
}
```

### Get Escrow Transactions
```http
GET /properties/transactions
Authorization: Bearer <token>
```

### Create Transaction
```http
POST /properties/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property-uuid",
  "propertyAddress": "123 Main Street",
  "clientName": "Bob Buyer",
  "role": "Buyer",
  "amount": 350000,
  "status": "Open",
  "stage": "Offer Accepted",
  "closingDate": "2024-06-30",
  "earnestMoney": 5000
}
```

---

## Portfolios (Securities)

### Get Client Portfolios
```http
GET /portfolios
Authorization: Bearer <token>
```

### Create Portfolio
```http
POST /portfolios
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "client-uuid",
  "clientName": "Wealthy Client",
  "totalValue": 1500000,
  "ytdReturn": 8.5,
  "riskProfile": "Moderate",
  "holdings": [
    {
      "id": "holding-1",
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "shares": 100,
      "price": 180.50,
      "value": 18050,
      "allocation": 25,
      "assetClass": "Equity"
    }
  ],
  "lastRebalanced": "2024-01-15"
}
```

### Get Compliance Documents
```http
GET /portfolios/compliance
Authorization: Bearer <token>
```

### Upload Compliance Doc
```http
POST /portfolios/compliance
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Form ADV - Q1 2024",
  "type": "Form ADV",
  "clientName": "ABC Corporation",
  "status": "Valid",
  "url": "https://example.com/form-adv.pdf"
}
```

### Get Advisory Fees
```http
GET /portfolios/fees
Authorization: Bearer <token>
```

### Create Fee
```http
POST /portfolios/fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "client-uuid",
  "clientName": "Wealthy Client",
  "aum": 1500000,
  "feeRate": 0.01,
  "billingPeriod": "Q1",
  "amount": 3750,
  "status": "Invoiced",
  "dueDate": "2024-04-01"
}
```

---

## Accounting

### Get Chart of Accounts
```http
GET /accounting/accounts
Authorization: Bearer <token>
```

### Create Account
```http
POST /accounting/accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "1000",
  "name": "Cash - Operating",
  "type": "Asset",
  "category": "Current Assets",
  "normalBalance": "debit",
  "balance": 50000
}
```

### Get Journal Entries
```http
GET /accounting/journal
Authorization: Bearer <token>
```

### Create Journal Entry
```http
POST /accounting/journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-03-01",
  "description": "Commission payment to advisor",
  "reference": "CHK-1234",
  "status": "posted",
  "lines": [
    {
      "accountId": "expense-account-uuid",
      "debit": 5000,
      "credit": 0,
      "description": "Commission expense",
      "advisorId": "advisor-uuid"
    },
    {
      "accountId": "cash-account-uuid",
      "debit": 0,
      "credit": 5000,
      "description": "Cash payment"
    }
  ]
}
```

---

## Banking

### Get Bank Accounts
```http
GET /banking/accounts
Authorization: Bearer <token>
```

### Connect Bank Account
```http
POST /banking/accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "institutionName": "Chase",
  "accountName": "Business Checking",
  "mask": "4432",
  "type": "Checking",
  "balance": 75000,
  "status": "active"
}
```

### Get Transactions
```http
GET /banking/transactions?accountId=bank-account-uuid
Authorization: Bearer <token>
```

### Create Transaction
```http
POST /banking/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankAccountId": "bank-account-uuid",
  "date": "2024-03-01",
  "merchant": "Office Depot",
  "amount": -125.50,
  "category": "Office Supplies",
  "status": "posted"
}
```

### Reconcile Transaction
```http
POST /banking/transactions/:id/reconcile
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Office Supplies",
  "journalEntryId": "journal-entry-uuid"
}
```

### Create Bank Rule
```http
POST /banking/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Starbucks Auto-Categorize",
  "conditions": [
    {
      "field": "merchant",
      "operator": "contains",
      "value": "Starbucks"
    }
  ],
  "assignCategory": "Meals & Entertainment"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting middleware to protect against abuse.

---

## Webhooks (Future)

Future versions will support webhooks for:
- New lead notifications
- Status change events
- Payment confirmations
- Document uploads

---

For additional support, please refer to the main README.md or contact the development team.
