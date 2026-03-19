# 社区医院预约挂号系统后端说明（对应 Vue 前端版）

## 一、后端定位

本目录为本项目的后端服务，面向根目录 `frontend/` 的 Vue 前端提供接口。

当前后端采用：

- Node.js
- Express
- express-session
- MySQL 8.0
- mysql2

> 注意：`public/` 目录中保留了旧版原生静态页，仅作为未构建 Vue 前端时的临时回退资源。当前毕设正式版本应以 `frontend/` 为主。

## 二、接口模块

### 1. 公开接口 `/api`

- 获取公告
- 获取科室
- 获取当天医生
- 智能分诊建议

### 2. 身份接口 `/api/auth`

- 管理员登录 / 退出 / 登录校验
- 医生注册 / 登录 / 退出 / 个人信息 / 修改密码
- 患者注册 / 登录 / 退出 / 个人信息 / 修改密码

### 3. 管理员接口 `/api/admin`

- 首页统计
- 个人信息
- 修改密码
- 公告管理
- 科室列表
- 医生列表
- 患者列表
- 排班列表与新增排班
- 挂号列表
- 就诊列表
- 住院列表

### 4. 医生接口 `/api/doctor`

- 查看公告
- 查看我的排班
- 查看挂号患者
- 患者叫号
- 保存就诊记录

### 5. 患者接口 `/api/patient`

- 查看当天医生
- 创建挂号
- 取消挂号
- 查看我的挂号
- 查看我的就诊
- 查看我的住院信息
- 在线充值

## 三、数据库初始化

在 MySQL 8.0 / Workbench 中执行：

```sql
backend/sql/init.sql
```

将创建数据库：

- `community_hospital`

并初始化以下核心表：

- `departments`
- `announcements`
- `admins`
- `doctors`
- `patients`
- `weekly_schedules`
- `appointments`
- `visit_records`
- `hospitalization_records`
- `recharge_records`
- `appointment_logs`

## 四、环境变量

复制模板：

```bash
cp .env.example .env
```

根据本机 MySQL 8.0 修改：

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `SESSION_SECRET`
- `PORT`

## 五、启动方式

```bash
npm install
npm start
```

默认启动地址：

```bash
http://localhost:3000
```

## 六、与 Vue 前端的配合方式

### 开发阶段

- 前端运行在 `5173`
- 后端运行在 `3000`
- 由 `frontend/vite.config.js` 代理 `/api` 与 `/health`

### 部署 / 演示阶段

当前 `server.js` 的逻辑是：

1. 若存在 `../frontend/dist/index.html`，优先托管 Vue 构建结果
2. 若不存在，则回退到 `public/` 旧静态页

因此正式演示前建议先执行前端构建：

```bash
cd ../frontend
npm install
npm run build
```

然后只启动后端。

## 七、默认演示账号

- 管理员：`admin / 123456`
- 医生：`doctor01 / 123456`
- 患者：`patient01 / 123456`

## 八、当前审查结论

我已重新核对：

- 后端入口文件存在
- 路由文件存在
- 控制器文件存在
- 数据库配置文件存在
- SQL 初始化脚本存在

但由于当前环境没有 MySQL 实例，最终数据库实机联调仍需在本地完成。
