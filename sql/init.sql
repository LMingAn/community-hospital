DROP DATABASE IF EXISTS community_hospital;
CREATE DATABASE community_hospital DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE community_hospital;

CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  location VARCHAR(100),
  status TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  title VARCHAR(50) NOT NULL,
  specialty VARCHAR(255),
  intro TEXT,
  avatar VARCHAR(255) DEFAULT '',
  status TINYINT NOT NULL DEFAULT 1,
  CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE doctor_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  schedule_date DATE NOT NULL,
  period ENUM('上午','下午','夜间') NOT NULL,
  max_number INT NOT NULL DEFAULT 20,
  booked_number INT NOT NULL DEFAULT 0,
  fee DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  status ENUM('available','stopped') NOT NULL DEFAULT 'available',
  CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_no VARCHAR(40) NOT NULL UNIQUE,
  patient_name VARCHAR(50) NOT NULL,
  gender VARCHAR(10),
  age INT,
  phone VARCHAR(20) NOT NULL,
  id_card VARCHAR(30),
  symptom TEXT,
  department_id INT NOT NULL,
  doctor_id INT NOT NULL,
  schedule_id INT NOT NULL,
  visit_date DATE NOT NULL,
  period ENUM('上午','下午','夜间') NOT NULL,
  status ENUM('待就诊','已签到','就诊中','已完成','已取消') NOT NULL DEFAULT '待就诊',
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_appointment_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES doctor_schedules(id)
);

CREATE TABLE appointment_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  remark VARCHAR(255),
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_log_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  nickname VARCHAR(50) NOT NULL
);

INSERT INTO departments (name, description, location) VALUES
('全科门诊', '处理常见病、多发病及基础健康咨询。', '门诊楼 1 层 A 区'),
('慢病管理科', '提供高血压、糖尿病等慢性病随访和管理。', '门诊楼 2 层 B 区'),
('儿保门诊', '提供儿童保健、疫苗咨询和基础检查。', '门诊楼 1 层 C 区');

INSERT INTO doctors (department_id, name, title, specialty, intro) VALUES
(1, '王丽', '主治医师', '发热、咳嗽、胃肠不适等常见病诊疗', '从事基层全科诊疗工作多年，擅长社区常见病初步诊疗与转诊建议。'),
(1, '张强', '住院医师', '呼吸道疾病、普通感冒、基础体检', '熟悉社区居民门诊接诊流程，擅长轻症初筛与健康宣教。'),
(2, '李敏', '副主任医师', '高血压、糖尿病、慢病随访', '长期从事慢病管理工作，熟悉血压、血糖长期控制方案。'),
(3, '陈晨', '主治医师', '儿童保健、疫苗接种咨询', '擅长儿童成长评估、营养指导及预防接种相关咨询。');

INSERT INTO doctor_schedules (doctor_id, schedule_date, period, max_number, booked_number, fee, status) VALUES
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', 20, 3, 15.00, 'available'),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', 15, 4, 15.00, 'available'),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', 15, 2, 12.00, 'available'),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', 18, 6, 20.00, 'available'),
(3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', 18, 0, 20.00, 'available'),
(4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', 16, 5, 18.00, 'available');

INSERT INTO admins (username, password_hash, nickname) VALUES
('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '系统管理员');
