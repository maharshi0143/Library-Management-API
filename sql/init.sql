CREATE TYPE book_status AS ENUM ('available', 'borrowed', 'reserved', 'maintenance');
CREATE TYPE member_status AS ENUM ('active', 'suspended');
CREATE TYPE transaction_status AS ENUM ('active', 'returned', 'overdue');

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status book_status NOT NULL DEFAULT 'available',
    total_copies INT NOT NULL CHECK (total_copies >= 0),
    available_copies INT NOT NULL CHECK (available_copies >= 0)
);

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    membership_number VARCHAR(100) UNIQUE NOT NULL,
    status member_status NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status transaction_status NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'fulfilled', 'cancelled')) DEFAULT 'active'
);
