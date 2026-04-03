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
('admin', sha2('123456', 256), '管理员', '12100000000', 'admin@hosp.local');

insert into doctors (dept_id, username, password_hash, name, gender, title, specialty, phone, profile) values
(1, 'doctor01', sha2('123456', 256), '王丽', '女', '主治医师', '发热咳嗽胃肠不适', '12200000001', '从事基层全科接诊多年，熟悉社区常见病诊疗流程。'),
(1, 'doctor02', sha2('123456', 256), '张强', '男', '住院医师', '感冒体检基础门诊', '12200000002', '擅长常见轻症筛查与健康宣教。'),
(2, 'doctor03', sha2('123456', 256), '李敏', '女', '副主任医师', '高血压糖尿病慢病随访', '12200000003', '长期从事慢病管理和复诊工作。'),
(3, 'doctor04', sha2('123456', 256), '陈晨', '女', '主治医师', '儿童发热保健咨询', '12200000004', '擅长儿童常见病和保健评估。');

insert into patients (username, password_hash, name, gender, age, phone, identity_card_no) values
('patient01', sha2('123456', 256), '刘芳', '女', 29, '12300000001', '123000000000000001'),
('patient02', sha2('123456', 256), '赵明', '男', 45, '12300000002', '123000000000000002');

insert into weekly_schedules (doctor_id, weekday, period, max_slots, fee, status) values
(1, 1, '上午', 20, 15.00, 1),
(1, 3, '上午', 20, 15.00, 1),
(1, 5, '下午', 18, 15.00, 1),
(2, 2, '上午', 16, 12.00, 1),
(3, 1, '下午', 18, 20.00, 1),
(3, 4, '上午', 18, 20.00, 1),
(4, 2, '上午', 15, 18.00, 1),
(4, 6, '上午', 15, 18.00, 1);
