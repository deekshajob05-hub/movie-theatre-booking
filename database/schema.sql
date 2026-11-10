CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  genre VARCHAR(50),
  duration_min INT,
  language VARCHAR(30),
  poster_url VARCHAR(255),
  description VARCHAR(500),
  rating DECIMAL(2,1),
  release_year INT
);

CREATE TABLE IF NOT EXISTS theatres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mall VARCHAR(100),
  area VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS shows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  show_time DATETIME NOT NULL,
  screen VARCHAR(20) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  total_seats INT DEFAULT 40,
  theatre_id INT,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  show_id INT NOT NULL,
  total_amount DECIMAL(8,2) NOT NULL,
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booked_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  show_id INT NOT NULL,
  seat_number VARCHAR(5) NOT NULL,
  UNIQUE KEY unique_seat_per_show (show_id, seat_number),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

INSERT INTO movies (title, genre, duration_min, language, description, rating, release_year) VALUES
('Inception', 'Sci-Fi', 148, 'English', 'A thief who steals secrets from dreams is given a task to plant an idea inside a mind.', 8.8, 2010),
('Interstellar', 'Sci-Fi', 169, 'English', 'A team of explorers travels through a wormhole in space to save humanity.', 8.7, 2014),
('KGF Chapter 2', 'Action', 168, 'Kannada', 'Rocky rises as the ruler of the Kolar Gold Fields and faces powerful enemies.', 8.2, 2022),
('RRR', 'Action', 182, 'Telugu', 'Two revolutionaries form a bond and fight against British rule in 1920s India.', 7.8, 2022),
('Kantara', 'Drama', 148, 'Kannada', 'A village, its forest and its traditions come together in a story of faith and conflict.', 8.2, 2022),
('3 Idiots', 'Comedy', 170, 'Hindi', 'Three engineering students find friendship, and question how education should work.', 8.4, 2009),
('Dangal', 'Sports', 161, 'Hindi', 'A former wrestler trains his daughters to become world class champions.', 8.3, 2016),
('Oppenheimer', 'Drama', 180, 'English', 'The story of the scientist who led the creation of the first atomic bomb.', 8.3, 2023);

INSERT INTO theatres (name, mall, area) VALUES
('PVR Orion Mall', 'Orion Mall', 'Rajajinagar'),
('INOX Garuda Mall', 'Garuda Mall', 'Magrath Road'),
('PVR Forum Mall', 'Forum Mall', 'Koramangala'),
('Cinepolis Nexus Shantiniketan', 'Nexus Shantiniketan', 'Whitefield'),
('PVR Phoenix Marketcity', 'Phoenix Marketcity', 'Mahadevapura'),
('INOX Mantri Square', 'Mantri Square', 'Malleshwaram');

INSERT INTO shows (movie_id, show_time, screen, price, theatre_id)
SELECT m.id,
  DATE_ADD(DATE_ADD(CURDATE(), INTERVAL d.n DAY), INTERVAL h.hr HOUR),
  CONCAT('Screen ', 1 + (m.id + t.id) % 5),
  180 + ((m.id + t.id) % 5) * 30,
  t.id
FROM movies m
JOIN theatres t ON (m.id + t.id) % 2 = 0
JOIN (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) d
JOIN (SELECT 10 AS hr UNION SELECT 13 UNION SELECT 16) h;