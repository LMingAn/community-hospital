CREATE DATABASE IF NOT EXISTS community_hospital_system CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE community_hospital_system;

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS admins;

CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  introduction VARCHAR(255) NOT NULL,
  floor_no VARCHAR(20) NOT NULL
);

CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  title VARCHAR(50) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  photo VARCHAR(255) DEFAULT '',
  CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  work_date DATE NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  total_count INT NOT NULL,
  remaining_count INT NOT NULL,
  CONSTRAINT fk_schedules_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_no VARCHAR(30) NOT NULL UNIQUE,
  patient_name VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  age INT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_card VARCHAR(30) DEFAULT '',
  department_id INT NOT NULL,
  doctor_id INT NOT NULL,
  schedule_id INT NOT NULL,
  symptom TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '待就诊',
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_appointments_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_appointments_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);

CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL
);

INSERT INTO departments (name, introduction, floor_no) VALUES
('全科门诊', '负责社区常见病、多发病的初步接诊与转诊。', '1层'),
('内科', '处理发热、消化、血压等常见内科问题。', '2层'),
('外科', '处理外伤、扭伤、浅表手术等情况。', '2层'),
('儿科', '儿童常见疾病诊断与健康咨询。', '3层'),
('妇科', '妇科基础检查、月经与孕期咨询。', '3层'),
('皮肤科', '处理皮疹、过敏、瘙痒等皮肤问题。', '3层');

INSERT INTO doctors (department_id, name, title, specialty, photo) VALUES
(1, '张文静', '主治医师', '擅长发热、感冒、慢病管理与家庭医生服务。', ''),
(2, '刘建华', '副主任医师', '擅长高血压、胃肠不适、常见内科疾病。', ''),
(3, '陈志强', '主治医师', '擅长软组织损伤、创面处理、关节疼痛。', ''),
(4, '李欣悦', '主治医师', '擅长儿童发热、咳嗽及常规保健指导。', ''),
(5, '王晓琳', '副主任医师', '擅长月经异常、孕期咨询、妇科基础诊疗。', ''),
(6, '周敏', '主治医师', '擅长皮炎、过敏、湿疹、常见皮肤病诊疗。', '');

INSERT INTO schedules (doctor_id, work_date, time_period, total_count, remaining_count) VALUES
(1, '2026-03-07', '08:30-10:00', 12, 10),
(1, '2026-03-07', '10:00-11:30', 12, 6),
(2, '2026-03-07', '08:30-10:00', 10, 3),
(2, '2026-03-07', '14:00-15:30', 10, 8),
(3, '2026-03-08', '09:00-11:00', 8, 5),
(4, '2026-03-08', '14:00-16:00', 10, 9),
(5, '2026-03-09', '08:30-10:30', 8, 4),
(6, '2026-03-09', '14:30-16:00', 10, 2);

INSERT INTO admins (username, password) VALUES
('admin', '123456');
