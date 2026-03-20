use community_hospital;

insert into departments (name, description, location) values
('全科门诊', '处理发热咳嗽腹痛等常见病', '门诊1层a区'),
('慢病管理科', '高血压糖尿病复诊与随访', '门诊2层b区'),
('儿科门诊', '儿童发热保健与评估', '门诊1层c区');

insert into announcements (title, content) values
('门诊就诊提醒', '请患者至少提前15分钟到院签到，过号需重新等待叫号。'),
('线上预约须知', '同一患者同一时间段不可重复挂号，叫号后不可在线取消。'),
('慢病复诊公告', '慢病管理科支持复诊开方、血压血糖随访服务。');

insert into admins (username, password_hash, nickname, phone, email) values
('admin', sha2('123456', 256), '管理员', '13800000000', 'admin@hosp.local');

insert into doctors (dept_id, username, password_hash, name, gender, title, specialty, phone, profile) values
(1, 'doctor01', sha2('123456', 256), '王丽', '女', '主治医师', '发热咳嗽胃肠不适', '13900000001', '从事基层全科接诊多年，熟悉社区常见病诊疗流程。'),
(1, 'doctor02', sha2('123456', 256), '张强', '男', '住院医师', '感冒体检基础门诊', '13900000002', '擅长常见轻症筛查与健康宣教。'),
(2, 'doctor03', sha2('123456', 256), '李敏', '女', '副主任医师', '高血压糖尿病慢病随访', '13900000003', '长期从事慢病管理和复诊工作。'),
(3, 'doctor04', sha2('123456', 256), '陈晨', '女', '主治医师', '儿童发热保健咨询', '13900000004', '擅长儿童常见病和保健评估。');

insert into patients (username, password_hash, name, gender, age, phone, identity_card_no, balance) values
('patient01', sha2('123456', 256), '刘芳', '女', 29, '13600000001', '320101199801010011', 120.00),
('patient02', sha2('123456', 256), '赵明', '男', 45, '13600000002', '320101198002020022', 88.50);

insert into weekly_schedules (doctor_id, weekday, period, max_slots, fee, status) values
(1, 1, '上午', 20, 15.00, 1),
(1, 3, '上午', 20, 15.00, 1),
(1, 5, '下午', 18, 15.00, 1),
(2, 2, '上午', 16, 12.00, 1),
(3, 1, '下午', 18, 20.00, 1),
(3, 4, '上午', 18, 20.00, 1),
(4, 2, '上午', 15, 18.00, 1),
(4, 6, '上午', 15, 18.00, 1);

insert into appointments (appointment_no, patient_id, doctor_id, dept_id, visit_date, period, queue_number, fee, symptom, triage_advice, status) values
('yy20260318001', 1, 1, 1, curdate(), '上午', 1, 15.00, '发热伴有轻微咳嗽', '建议挂全科门诊', '待叫号'),
('yy20260318002', 2, 3, 2, curdate(), '下午', 1, 20.00, '高血压复诊开药', '建议挂慢病管理科', '已叫号');

insert into appointment_logs (appointment_id, action, remark) values
(1, '创建挂号', '患者完成线上预约挂号'),
(2, '创建挂号', '患者完成线上预约挂号'),
(2, '医生叫号', '医生已对患者进行叫号');

insert into visit_records (appointment_id, patient_id, doctor_id, diagnosis, advice_content_html, prescription, need_inpatient) values
(2, 2, 3, '原发性高血压', '<p><strong>医嘱：</strong>继续规律服药，注意低盐饮食，1周后复测血压。</p>', '氨氯地平片1盒', 0);
