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

CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  email VARCHAR(80) DEFAULT ''
);

CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  name VARCHAR(50) NOT NULL,
  gender ENUM('男','女') DEFAULT '男',
  title VARCHAR(50) NOT NULL,
  specialty VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  intro TEXT,
  avatar VARCHAR(255) DEFAULT '',
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  name VARCHAR(50) NOT NULL,
  gender ENUM('男','女') DEFAULT '男',
  age INT DEFAULT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  id_card VARCHAR(30) DEFAULT '',
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weekly_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  weekday TINYINT NOT NULL COMMENT '1-7 对应周一到周日',
  period ENUM('上午','下午','夜间') NOT NULL,
  max_number INT NOT NULL DEFAULT 20,
  fee DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  status TINYINT NOT NULL DEFAULT 1,
  CONSTRAINT fk_weekly_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_no VARCHAR(40) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  department_id INT NOT NULL,
  visit_date DATE NOT NULL,
  period ENUM('上午','下午','夜间') NOT NULL,
  queue_no INT NOT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  symptom TEXT,
  triage_result VARCHAR(100) DEFAULT '',
  status ENUM('待叫号','已叫号','就诊中','已完成','已取消') NOT NULL DEFAULT '待叫号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_appointment_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE visit_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  diagnosis VARCHAR(255) DEFAULT '',
  advice_html MEDIUMTEXT,
  prescription TEXT,
  need_hospitalization TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_visit_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_visit_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE hospitalization_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  visit_record_id INT NOT NULL,
  ward_no VARCHAR(30) DEFAULT '',
  bed_no VARCHAR(30) DEFAULT '',
  reason_text VARCHAR(255) DEFAULT '',
  status ENUM('待入院','住院中','已出院') NOT NULL DEFAULT '待入院',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hospital_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_hospital_visit FOREIGN KEY (visit_record_id) REFERENCES visit_records(id)
);

CREATE TABLE recharge_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remark VARCHAR(100) DEFAULT '线上充值',
  CONSTRAINT fk_recharge_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE appointment_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  remark VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

INSERT INTO departments (name, description, location) VALUES
('全科门诊', '处理发热、咳嗽、腹痛等社区常见病。', '门诊楼 1 层 A 区'),
('慢病管理科', '高血压、糖尿病、复诊开药与慢病随访。', '门诊楼 2 层 B 区'),
('儿科门诊', '儿童感冒、发热、保健和生长发育评估。', '门诊楼 1 层 C 区');

INSERT INTO announcements (title, content) VALUES
('门诊就诊提醒', '请患者至少提前 15 分钟到院签到，过号需重新等待叫号。'),
('线上预约须知', '同一患者同一时间段不可重复挂号，叫号后不可在线取消。'),
('慢病复诊公告', '慢病管理科支持复诊开方、血压血糖随访服务。');

INSERT INTO admins (username, password_hash, nickname, phone, email) VALUES
('admin', SHA2('123456', 256), '系统管理员', '13800000000', 'admin@hospital.local');

INSERT INTO doctors (department_id, username, password_hash, name, gender, title, specialty, phone, intro) VALUES
(1, 'doctor01', SHA2('123456', 256), '王丽', '女', '主治医师', '发热、咳嗽、胃肠不适', '13900000001', '从事基层全科接诊多年，熟悉社区常见病诊疗流程。'),
(1, 'doctor02', SHA2('123456', 256), '张强', '男', '住院医师', '感冒、体检、基础门诊', '13900000002', '擅长常见轻症筛查与健康宣教。'),
(2, 'doctor03', SHA2('123456', 256), '李敏', '女', '副主任医师', '高血压、糖尿病、慢病随访', '13900000003', '长期从事慢病管理和复诊工作。'),
(3, 'doctor04', SHA2('123456', 256), '陈晨', '女', '主治医师', '儿童发热、保健咨询', '13900000004', '擅长儿童常见病和保健评估。');

INSERT INTO patients (username, password_hash, name, gender, age, phone, id_card, balance) VALUES
('patient01', SHA2('123456', 256), '刘芳', '女', 29, '13600000001', '320101199801010011', 120.00),
('patient02', SHA2('123456', 256), '赵明', '男', 45, '13600000002', '320101198002020022', 88.50);

INSERT INTO weekly_schedules (doctor_id, weekday, period, max_number, fee, status) VALUES
(1, 1, '上午', 20, 15.00, 1),
(1, 3, '上午', 20, 15.00, 1),
(1, 5, '下午', 18, 15.00, 1),
(2, 2, '上午', 16, 12.00, 1),
(3, 1, '下午', 18, 20.00, 1),
(3, 4, '上午', 18, 20.00, 1),
(4, 2, '上午', 15, 18.00, 1),
(4, 6, '上午', 15, 18.00, 1);

INSERT INTO appointments (appointment_no, patient_id, doctor_id, department_id, visit_date, period, queue_no, fee, symptom, triage_result, status) VALUES
('YY20260318001', 1, 1, 1, CURDATE(), '上午', 1, 15.00, '发热伴有轻微咳嗽', '建议挂全科门诊', '待叫号'),
('YY20260318002', 2, 3, 2, CURDATE(), '下午', 1, 20.00, '高血压复诊开药', '建议挂慢病管理科', '已叫号');

INSERT INTO appointment_logs (appointment_id, action, remark) VALUES
(1, '创建挂号', '患者完成线上预约挂号'),
(2, '创建挂号', '患者完成线上预约挂号'),
(2, '医生叫号', '医生已对患者进行叫号');

INSERT INTO visit_records (appointment_id, patient_id, doctor_id, diagnosis, advice_html, prescription, need_hospitalization) VALUES
(2, 2, 3, '原发性高血压', '<p><strong>医嘱：</strong>继续规律服药，注意低盐饮食，1 周后复测血压。</p>', '氨氯地平片 1 盒', 0);
