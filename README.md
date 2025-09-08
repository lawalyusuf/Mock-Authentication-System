# Mock Authentication System

A secure authentication and authorization system built with **Node.js**, **Express**, and **Sequelize ORM**.  
This project supports **user registration, login, OTP verification, JWT token-based authentication, refresh tokens, and logout** with rate-limiting and challenge-based security.

---

## Features

- **User Registration** with passcode, referral code, and date of birth.
- **OTP (One-Time Password)** delivery and validation via preferred channel (SMS, Email, etc.).
- **JWT Authentication** with access & refresh tokens.
- **Token Refresh** mechanism to extend session without re-login.
- **Rate Limiting** and challenge mechanism to prevent brute-force login attempts.
- **Secure Logout** with refresh token revocation.
- **Express Validator** for input validation.
- Organized **Controller / Service / Middleware** architecture.

---

## Tech Stack

- **Node.js** (v22+)
- **Express.js**
- **Sequelize ORM** (with PostgreSQL/MySQL/SQLite)
- **JWT** (jsonwebtoken)
- **Express-Validator**
- **Rate Limiting Middleware**
- **Nodemailer / SMS Gateway** (for OTP channel)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```
