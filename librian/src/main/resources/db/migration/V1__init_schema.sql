CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255),
    picture VARCHAR(1024),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE books (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    description VARCHAR(1000),
    isbn VARCHAR(32),
    publisher VARCHAR(255),
    status VARCHAR(32),
    year INTEGER,
    cover_url VARCHAR(1024),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_users_email ON users(email);
