CREATE DATABASE recommendation_db;
\c recommendation_db;
-- Usuarios del sistema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Catálogo de películas
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(100),
    release_year INTEGER
);

-- Calificaciones de usuarios
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    movie_id INTEGER REFERENCES movies(id),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5)
);