-- Database Schema for Institutional Management System
-- This file contains all the SQL statements to create the complete database structure

-- Create Enum Types
CREATE TYPE class_room_types AS ENUM ('theoretical', 'Workshop', 'Computer Lab', 'Gym');
CREATE TYPE shifts AS ENUM ('Morning shift', 'Late shift');
CREATE TYPE days AS ENUM ('M', 'T', 'W', 'TH', 'F');

-- Create Teachers Table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    file_number VARCHAR(40) NOT NULL,
    birthdate DATE NOT NULL,
    nationality VARCHAR(40) NOT NULL,
    address VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Classrooms Table
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(40) NOT NULL,
    class_room_type class_room_types NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL,
    class_room_id UUID NOT NULL,
    shift shifts NOT NULL,
    cycle VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_room_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Create Subjects Table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(40) NOT NULL,
    course_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create Subjects Teachers Junction Table
CREATE TABLE subjects_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(teacher_id, subject_id)
);

-- Create Availabilities Table
CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    day days NOT NULL,
    time_ranges TIME[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Create Users Table (for authentication)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_teachers_id_number ON teachers(id_number);
CREATE INDEX idx_teachers_file_number ON teachers(file_number);
CREATE INDEX idx_subjects_teachers_teacher_id ON subjects_teachers(teacher_id);
CREATE INDEX idx_subjects_teachers_subject_id ON subjects_teachers(subject_id);
CREATE INDEX idx_availabilities_teacher_id ON availabilities(teacher_id);
CREATE INDEX idx_courses_class_room_id ON courses(class_room_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);

-- Create Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_teachers_updated_at BEFORE UPDATE ON subjects_teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availabilities_updated_at BEFORE UPDATE ON availabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- Sample Classrooms
INSERT INTO classrooms (name, class_room_type) VALUES
('Aula 101', 'theoretical'),
('Taller 1', 'Workshop'),
('Laboratorio Informática', 'Computer Lab'),
('Gimnasio Principal', 'Gym');

-- Sample Courses
INSERT INTO courses (name, class_room_id, shift, cycle) VALUES
('Primer Año', (SELECT id FROM classrooms WHERE name = 'Aula 101'), 'Morning shift', '2024'),
('Segundo Año', (SELECT id FROM classrooms WHERE name = 'Aula 101'), 'Late shift', '2024');

-- Sample Subjects
INSERT INTO subjects (name, course_id) VALUES
('Matemáticas', (SELECT id FROM courses WHERE name = 'Primer Año')),
('Historia', (SELECT id FROM courses WHERE name = 'Primer Año')),
('Física', (SELECT id FROM courses WHERE name = 'Segundo Año')); 