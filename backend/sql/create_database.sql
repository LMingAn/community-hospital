drop database if exists community_hospital;
create database community_hospital default character set utf8mb4 collate utf8mb4_unicode_ci;
use community_hospital;

create table admins (
  id int primary key auto_increment comment '主键，管理员id',
  username varchar(20) not null unique comment '登录账号',
  password_hash varchar(64) not null comment '密码摘要',
  nickname varchar(10) not null comment '管理员昵称',
  phone varchar(11) default '' comment '手机号',
  email varchar(30) default '' comment '邮箱地址'
) comment='管理员信息表';

create table departments (
  id int primary key auto_increment comment '主键，科室id',
  name varchar(10) not null comment '科室名称',
  description varchar(50) default '' comment '科室简介',
  location varchar(20) default '' comment '科室位置',
  status tinyint not null default 1 comment '状态：1启用，0停用'
) comment='科室信息表';

create table doctors (
  id int primary key auto_increment comment '主键，医生id',
  dept_id int not null comment '科室id',
  username varchar(20) not null unique comment '登录账号',
  password_hash varchar(64) not null comment '密码摘要',
  name varchar(20) not null comment '姓名',
  gender enum('男','女') default '男' comment '性别',
  title varchar(10) not null comment '职称',
  specialty varchar(50) default '' comment '擅长方向',
  phone varchar(11) not null comment '联系电话',
  profile text comment '个人简介',
  status tinyint not null default 1 comment '状态：1在职，0停用',
  constraint fk_doctor_department foreign key (dept_id) references departments(id)
) comment='医生信息表';

create table patients (
  id int primary key auto_increment comment '主键，患者id',
  username varchar(20) not null unique comment '登录账号',
  password_hash varchar(64) not null comment '密码摘要',
  name varchar(20) not null comment '姓名',
  gender enum('男','女') default '男' comment '性别',
  age int default null comment '年龄',
  phone varchar(11) not null unique comment '手机号',
  identity_card_no char(18) default '' comment '身份证号',
  status tinyint not null default 1 comment '状态：1正常，0停用',
  created_at datetime not null default current_timestamp comment '创建时间'
) comment='患者信息表';

create table announcements (
  id int primary key auto_increment comment '主键，公告id',
  title varchar(50) not null comment '公告标题',
  content text not null comment '公告内容',
  published_at datetime not null default current_timestamp comment '发布时间',
  status tinyint not null default 1 comment '状态：1发布，0下线'
) comment='系统公告表';

create table weekly_schedules (
  id int primary key auto_increment comment '主键，排班id',
  doctor_id int not null comment '医生id',
  weekday tinyint not null comment '星期几，1到7表示周一到周日',
  period enum('上午','下午','夜间') not null comment '出诊时段',
  max_slots int not null default 20 comment '最大号源数',
  fee decimal(10,2) not null default 15.00 comment '挂号费用',
  status tinyint not null default 1 comment '状态：1启用，0停用',
  constraint fk_weekly_schedule_doctor foreign key (doctor_id) references doctors(id)
) comment='医生周排班表';

create table appointments (
  id int primary key auto_increment comment '主键，挂号id',
  appointment_no varchar(30) not null unique comment '挂号单号',
  patient_id int not null comment '患者id',
  doctor_id int not null comment '医生id',
  dept_id int not null comment '科室id',
  visit_date date not null comment '就诊日期',
  period enum('上午','下午','夜间') not null comment '就诊时段',
  queue_number int not null comment '队列序号',
  fee decimal(10,2) not null default 0 comment '挂号费用',
  symptom text comment '症状描述',
  triage_advice varchar(50) default '' comment '分诊建议',
  status enum('待叫号','已叫号','就诊中','已完成','已取消') not null default '待叫号' comment '挂号状态',
  created_at datetime not null default current_timestamp comment '创建时间',
  constraint fk_appointment_patient foreign key (patient_id) references patients(id),
  constraint fk_appointment_doctor foreign key (doctor_id) references doctors(id),
  constraint fk_appointment_department foreign key (dept_id) references departments(id)
) comment='预约挂号表';

create table visit_records (
  id int primary key auto_increment comment '主键，就诊记录id',
  appointment_id int not null unique comment '挂号id',
  patient_id int not null comment '患者id',
  doctor_id int not null comment '医生id',
  diagnosis varchar(50) default '' comment '诊断结果',
  advice_content_html mediumtext comment '医嘱内容',
  prescription text comment '处方信息',
  need_inpatient tinyint not null default 0 comment '是否需要住院：1是，0否',
  created_at datetime not null default current_timestamp comment '创建时间',
  constraint fk_visit_appointment foreign key (appointment_id) references appointments(id),
  constraint fk_visit_patient foreign key (patient_id) references patients(id),
  constraint fk_visit_doctor foreign key (doctor_id) references doctors(id)
) comment='患者就诊记录表';

create table hospitalization_records (
  id int primary key auto_increment comment '主键，住院登记id',
  patient_id int not null comment '患者id',
  visit_id int not null comment '就诊记录id',
  ward_no varchar(10) default '' comment '病区号',
  bed_no varchar(10) default '' comment '床位号',
  admission_reason varchar(100) default '' comment '住院原因',
  status enum('待入院','住院中','已出院') not null default '待入院' comment '住院状态',
  created_at datetime not null default current_timestamp comment '登记时间',
  constraint fk_hospital_patient foreign key (patient_id) references patients(id),
  constraint fk_hospital_visit foreign key (visit_id) references visit_records(id)
) comment='住院登记表';
