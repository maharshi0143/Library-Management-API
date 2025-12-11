# Library Management System API

A comprehensive RESTful API for library management featuring state machine implementation for book lifecycle management, automated fine calculation, and robust business rule enforcement.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [State Machine Implementation](#state-machine-implementation)
- [Business Rules Implementation](#business-rules-implementation)
- [Testing Guide](#testing-guide)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)

---

## Overview

This Library Management System provides a complete backend solution for managing library operations including book inventory, member registration, borrowing transactions, and fine management. The system implements sophisticated state machines for resource lifecycle management and enforces complex business rules to ensure data integrity and operational compliance.

## Features

- ✅ **Complete CRUD Operations** for Books and Members
- ✅ **Transaction Management** - Borrow and return books with automated tracking
- ✅ **State Machine** - Manages book status transitions with validation
- ✅ **Automated Fine Calculation** - $0.50 per day for overdue books
- ✅ **Member Suspension System** - Automatic suspension for repeated violations
- ✅ **Business Rule Enforcement** - Maximum borrowing limits, unpaid fine restrictions
- ✅ **Overdue Tracking** - Real-time identification of overdue transactions
- ✅ **RESTful Design** - Standard HTTP methods and status codes

## Technology Stack

- **Runtime Environment:** Node.js (v14+)
- **Web Framework:** Express.js
- **Database:** PostgreSQL (v12+)
- **Database Client:** node-postgres (pg)
- **Environment Management:** dotenv
- **Development Tools:** nodemon

---

## Prerequisites

Ensure the following are installed on your system:

1. **Node.js** (version 14 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (version 12 or higher)
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

4. **Git** (optional, for cloning)
   - Download: https://git-scm.com/

---

## Installation & Setup

### Step 1: Create Project Structure

```bash
# Create project directory
mkdir library-management-system
cd library-management-system

# Create folder structure
mkdir -p src/config src/models src/services src/validators src/routes src/middleware database

```

### Step 2: Install Dependencies

Create or update `package.json`:

```json
{
  "name": "library-management-system",
  "version": "1.0.0",
  "description": "RESTful API for library management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

Install packages:

```bash
npm install
```

### Step 3: Database Setup

#### 3.1 Access PostgreSQL

```bash
# Linux/Mac
sudo -u postgres psql

# Windows
psql -U postgres
```

#### 3.2 Create Database

```sql
-- Create the database
CREATE DATABASE library_management;

-- Verify creation
\l

-- Connect to the database
\c library_management
```

#### 3.3 Run Schema File

**Option 1: From psql prompt**
```sql
\i /full/path/to/library-management-system/database/schema.sql
```

**Option 2: From command line**
```bash
psql -U postgres -d library_management -f database/schema.sql
```

#### 3.4 Verify Tables

```sql
-- List all tables
\dt

-- Expected output:
-- books
-- members
-- transactions
-- fines

-- Check a table structure
\d books
```

### Step 4: Environment Configuration

Create `.env` file in project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=maharshi
```


### Step 5: Verify Setup

```bash
# Test database connection
psql -U postgres -d library_management -c "SELECT NOW();"

# Should return current timestamp if connection is successful
```

---

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Expected Output

```
Database connected successfully
Current database time: 2024-12-07T10:30:00.000Z
╔════════════════════════════════════════════════════════╗
║   Library Management System API                        ║
║   Server running on http://localhost:3000              ║
║   Environment: development                             ║
╚════════════════════════════════════════════════════════╝
```

### Verify Server is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Library Management System API is running",
  "timestamp": "2024-12-07T10:30:00.000Z"
}
```

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Books Endpoints

### 1. Create Book

Creates a new book in the library inventory.

**Endpoint:** `POST /api/books`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "isbn": "978-0-061-12008-4",
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "category": "Fiction",
  "total_copies": 5
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isbn": "978-0-061-12008-4",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "category": "Fiction",
    "status": "available",
    "total_copies": 5,
    "available_copies": 5,
    "created_at": "2024-12-07T10:30:00.000Z",
    "updated_at": "2024-12-07T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data
- `409 Conflict` - ISBN already exists

---

### 2. Get All Books

Retrieves all books in the library.

**Endpoint:** `GET /api/books`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "isbn": "978-0-061-12008-4",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "category": "Fiction",
      "status": "available",
      "total_copies": 5,
      "available_copies": 4,
      "created_at": "2024-12-07T10:30:00.000Z",
      "updated_at": "2024-12-07T10:35:00.000Z"
    },
    {
      "id": 2,
      "isbn": "978-0-141-43951-8",
      "title": "1984",
      "author": "George Orwell",
      "category": "Fiction",
      "status": "available",
      "total_copies": 3,
      "available_copies": 3,
      "created_at": "2024-12-07T10:32:00.000Z",
      "updated_at": "2024-12-07T10:32:00.000Z"
    }
  ]
}
```

---

### 3. Get Available Books

Retrieves only books that are currently available for borrowing.

**Endpoint:** `GET /api/books/available`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "isbn": "978-0-061-12008-4",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "category": "Fiction",
      "status": "available",
      "total_copies": 5,
      "available_copies": 4,
      "created_at": "2024-12-07T10:30:00.000Z",
      "updated_at": "2024-12-07T10:35:00.000Z"
    }
  ]
}
```

---

### 4. Get Book by ID

Retrieves details of a specific book.

**Endpoint:** `GET /api/books/:id`

**Example:** `GET /api/books/1`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isbn": "978-0-061-12008-4",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "category": "Fiction",
    "status": "available",
    "total_copies": 5,
    "available_copies": 4,
    "created_at": "2024-12-07T10:30:00.000Z",
    "updated_at": "2024-12-07T10:35:00.000Z"
  }
}
```

**Error Response:**
- `404 Not Found` - Book with specified ID does not exist

---

### 5. Update Book

Updates an existing book's information.

**Endpoint:** `PUT /api/books/:id`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "isbn": "978-0-061-12008-4",
  "title": "To Kill a Mockingbird - Special Edition",
  "author": "Harper Lee",
  "category": "Classic Fiction",
  "total_copies": 6,
  "status": "available"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isbn": "978-0-061-12008-4",
    "title": "To Kill a Mockingbird - Special Edition",
    "author": "Harper Lee",
    "category": "Classic Fiction",
    "status": "available",
    "total_copies": 6,
    "available_copies": 4,
    "created_at": "2024-12-07T10:30:00.000Z",
    "updated_at": "2024-12-07T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid state transition
- `404 Not Found` - Book not found

---

### 6. Delete Book

Deletes a book from the library.

**Endpoint:** `DELETE /api/books/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

**Error Response:**
- `404 Not Found` - Book not found

---

## Members Endpoints

### 7. Create Member

Registers a new library member.

**Endpoint:** `POST /api/members`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "membership_number": "MEM001"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "membership_number": "MEM001",
    "status": "active",
    "created_at": "2024-12-07T10:30:00.000Z",
    "updated_at": "2024-12-07T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format or missing fields
- `409 Conflict` - Email or membership number already exists

---

### 8. Get All Members

Retrieves all registered members.

**Endpoint:** `GET /api/members`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "membership_number": "MEM001",
      "status": "active",
      "created_at": "2024-12-07T10:30:00.000Z",
      "updated_at": "2024-12-07T10:30:00.000Z"
    }
  ]
}
```

---

### 9. Get Member by ID

Retrieves details of a specific member.

**Endpoint:** `GET /api/members/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "membership_number": "MEM001",
    "status": "active",
    "created_at": "2024-12-07T10:30:00.000Z",
    "updated_at": "2024-12-07T10:30:00.000Z"
  }
}
```

**Error Response:**
- `404 Not Found` - Member not found

---

### 10. Get Member's Borrowed Books

Retrieves all books currently borrowed by a member.

**Endpoint:** `GET /api/members/:id/borrowed`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "member": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "status": "active"
    },
    "borrowed_books": [
      {
        "id": 1,
        "isbn": "978-0-061-12008-4",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "category": "Fiction",
        "status": "borrowed",
        "transaction_id": 1,
        "borrowed_at": "2024-12-07T10:35:00.000Z",
        "due_date": "2024-12-21T10:35:00.000Z",
        "transaction_status": "active"
      }
    ]
  }
}
```

---

### 11. Update Member

Updates member information.

**Endpoint:** `PUT /api/members/:id`

**Request Body:**
```json
{
  "name": "John Doe Jr.",
  "email": "john.jr@example.com",
  "membership_number": "MEM001",
  "status": "active"
}
```

**Response:** `200 OK`

---

### 12. Delete Member

Deletes a member from the system.

**Endpoint:** `DELETE /api/members/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

---

## Transactions Endpoints

### 13. Borrow Book

Creates a new borrowing transaction.

**Endpoint:** `POST /api/transactions/borrow`

**Request Body:**
```json
{
  "book_id": 1,
  "member_id": 1
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "book_id": 1,
    "member_id": 1,
    "borrowed_at": "2024-12-07T10:35:00.000Z",
    "due_date": "2024-12-21T10:35:00.000Z",
    "returned_at": null,
    "status": "active",
    "created_at": "2024-12-07T10:35:00.000Z",
    "updated_at": "2024-12-07T10:35:00.000Z"
  },
  "message": "Book borrowed successfully"
}
```

**Error Responses:**

*Member has reached borrowing limit:*
```json
{
  "success": false,
  "message": "Member has reached the maximum limit of 3 borrowed books"
}
```

*Member has unpaid fines:*
```json
{
  "success": false,
  "message": "Member has unpaid fines and cannot borrow books"
}
```

*Member is suspended:*
```json
{
  "success": false,
  "message": "Member account is suspended"
}
```

*Book not available:*
```json
{
  "success": false,
  "message": "Book is not available"
}
```

---

### 14. Return Book

Processes a book return and calculates fines if overdue.

**Endpoint:** `POST /api/transactions/:id/return`

**Success Response (On Time):** `200 OK`
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": 1,
      "book_id": 1,
      "member_id": 1,
      "borrowed_at": "2024-12-07T10:35:00.000Z",
      "due_date": "2024-12-21T10:35:00.000Z",
      "returned_at": "2024-12-15T14:20:00.000Z",
      "status": "returned"
    },
    "fine": null,
    "member_status": {
      "suspended": false,
      "overdueCount": 0
    }
  },
  "message": "Book returned successfully"
}
```

**Success Response (Overdue with Fine):** `200 OK`
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": 1,
      "book_id": 1,
      "member_id": 1,
      "borrowed_at": "2024-12-07T10:35:00.000Z",
      "due_date": "2024-12-21T10:35:00.000Z",
      "returned_at": "2024-12-26T14:20:00.000Z",
      "status": "returned"
    },
    "fine": {
      "id": 1,
      "member_id": 1,
      "transaction_id": 1,
      "amount": "2.50",
      "paid_at": null,
      "created_at": "2024-12-26T14:20:00.000Z"
    },
    "member_status": {
      "suspended": false,
      "overdueCount": 1
    }
  },
  "message": "Book returned. Fine of $2.50 applied."
}
```

**Error Responses:**
- `404 Not Found` - Transaction not found
- `400 Bad Request` - Book already returned

---

### 15. Get Overdue Transactions

Retrieves all overdue transactions.

**Endpoint:** `GET /api/transactions/overdue`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "book_id": 2,
      "member_id": 1,
      "borrowed_at": "2024-11-20T10:00:00.000Z",
      "due_date": "2024-12-04T10:00:00.000Z",
      "returned_at": null,
      "status": "overdue",
      "book_title": "1984",
      "book_author": "George Orwell",
      "member_name": "John Doe",
      "member_email": "john.doe@example.com"
    }
  ],
  "count": 1
}
```

---

## Fines Endpoints

### 16. Pay Fine

Marks a fine as paid.

**Endpoint:** `POST /api/fines/:id/pay`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "member_id": 1,
    "transaction_id": 1,
    "amount": "2.50",
    "paid_at": "2024-12-07T15:00:00.000Z",
    "created_at": "2024-12-07T14:20:00.000Z",
    "updated_at": "2024-12-07T15:00:00.000Z"
  },
  "message": "Fine paid successfully"
}
```

**Error Responses:**
- `404 Not Found` - Fine not found
- `400 Bad Request` - Fine already paid

---

## Database Schema

### Schema Diagram

```
┌─────────────────────────┐
│         BOOKS           │
├─────────────────────────┤
│ id (PK, SERIAL)         │
│ isbn (VARCHAR, UNIQUE)  │
│ title (VARCHAR)         │
│ author (VARCHAR)        │
│ category (VARCHAR)      │
│ status (ENUM)           │
│ total_copies (INTEGER)  │
│ available_copies (INT)  │
│ created_at (TIMESTAMP)  │
│ updated_at (TIMESTAMP)  │
└─────────────────────────┘
            │
            │ 1
            │
            │ N
┌─────────────────────────┐         ┌─────────────────────────┐
│     TRANSACTIONS        │    N:1  │        MEMBERS          │
├─────────────────────────┤─────────├─────────────────────────┤
│ id (PK, SERIAL)         │         │ id (PK, SERIAL)         │
│ book_id (FK)            │         │ name (VARCHAR)          │
│ member_id (FK)          │         │ email (VARCHAR, UNIQUE) │
│ borrowed_at (TIMESTAMP) │         │ membership_number       │
│ due_date (TIMESTAMP)    │         │ status (ENUM)           │
│ returned_at (TIMESTAMP) │         │ created_at (TIMESTAMP)  │
│ status (ENUM)           │         │ updated_at (TIMESTAMP)  │
│ created_at (TIMESTAMP)  │         └─────────────────────────┘
│ updated_at (TIMESTAMP)  │                     │
└─────────────────────────┘                     │ 1
            │                                   │
            │ 1                                 │ N
            │                                   │
            │ N                   ┌─────────────────────────┐
            └─────────────────────│         FINES           │
                                  ├─────────────────────────┤
                                  │ id (PK, SERIAL)         │
                                  │ member_id (FK)          │
                                  │ transaction_id (FK)     │
                                  │ amount (DECIMAL)        │
                                  │ paid_at (TIMESTAMP)     │
                                  │ created_at (TIMESTAMP)  │
                                  │ updated_at (TIMESTAMP)  │
                                  └─────────────────────────┘
```

### Table Definitions

#### 1. Books Table

Stores library book inventory.

```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status book_status DEFAULT 'available',
    total_copies INTEGER NOT NULL CHECK (total_copies > 0),
    available_copies INTEGER NOT NULL CHECK (available_copies >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_available_copies CHECK (available_copies <= total_copies)
);
```

**Status Enum Values:**
- `available` - Book is available for borrowing
- `borrowed` - All copies are currently borrowed
- `reserved` - Book is reserved for a member
- `maintenance` - Book is under maintenance/repair

**Constraints:**
- `isbn` must be unique
- `total_copies` must be greater than 0
- `available_copies` cannot exceed `total_copies`
- `available_copies` cannot be negative

---

#### 2. Members Table

Stores library member information.

```sql
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    status member_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Status Enum Values:**
- `active` - Member can borrow books
- `suspended` - Member cannot borrow books (3+ overdue books)

**Constraints:**
- `email` must be unique
- `membership_number` must be unique

---

#### 3. Transactions Table

Records all borrowing transactions.

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP,
    status transaction_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Status Enum Values:**
- `active` - Book is currently borrowed
- `returned` - Book has been returned
- `overdue` - Book is past due date and not returned

**Relationships:**
- `book_id` references `books(id)`
- `member_id` references `members(id)`
- Cascade delete: when book/member deleted, transactions are also deleted

---

#### 4. Fines Table

Tracks overdue fines for members.

```sql
CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationships:**
- `member_id` references `members(id)`
- `transaction_id` references `transactions(id)`

**Constraints:**
- `amount` must be non-negative
- `paid_at` is NULL until fine is paid

---

### Database Indexes

For optimal query performance, the following indexes are created:

```sql
-- Books indexes
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_isbn ON books(isbn);

-- Members indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_number ON members(membership_number);
CREATE INDEX idx_members_status ON members(status);

-- Transactions indexes
CREATE INDEX idx_transactions_book_id ON transactions(book_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);

-- Fines indexes
CREATE INDEX idx_fines_member_id ON fines(member_id);
CREATE INDEX idx_fines_transaction_id ON fines(transaction_id);
CREATE INDEX idx_fines_paid_at ON fines(paid_at);
```

---

## State Machine Implementation

### Book Status State Machine

The book status follows a well-defined state machine with specific allowed transitions. This ensures data integrity and prevents invalid status changes.

#### State Diagram

```
                    ┌──────────────┐
         ┌──────────┤  AVAILABLE   ├──────────┐
         │          └──────┬───────┘          │
         │                 │                  │
         │                 │ borrow           │ reserve
         │                 ▼                  ▼
         │          ┌─────────────┐    ┌──────────┐
    return│          │  BORROWED   │    │ RESERVED │
         │          └──────┬──────┘    └────┬─────┘
         │                 │                 │
         │                 │                 │ borrow
         │                 │                 ▼
         │                 │          ┌──────────┐
         └─────────────────┴──────────┤ BORROWED │
                           │          └──────────┘
                           │
                           │ maintenance
                           ▼
                    ┌──────────────┐
                    │ MAINTENANCE  │
                    └──────┬───────┘
                           │
                           │ repair complete
                           ▼
                    ┌──────────────┐
                    │  AVAILABLE   │
                    └──────────────┘
```

#### Valid State Transitions

The state machine implementation is located in `src/validators/businessRules.js`:

```javascript
static validateBookStateTransition(currentStatus, newStatus) {
  const validTransitions = {
    'available': ['borrowed', 'reserved', 'maintenance'],
    'borrowed': ['available', 'maintenance'],
    'reserved': ['borrowed', 'available', 'maintenance'],
    'maintenance': ['available']
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return { 
      valid: false, 
      message: `Invalid state transition from '${currentStatus}' to '${newStatus}'` 
    };
  }

  return { valid: true };
}
```

#### State Transition Rules

| Current Status | Allowed Next States | Trigger Event |