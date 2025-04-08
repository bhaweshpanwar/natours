# 🌍 Natours Tours Booking – Full Stack Web Application

A professional and production-ready full-stack tour booking application built using the **PERN** (PostgreSQL, Express.js, React.js, Node.js) stack. It features secure authentication, robust APIs, Stripe integration for payments, and follows MVC architecture with SSR (server-side rendering).

**Live Demo:** [natours.bhaweshpanwar.xyz](https://natours.bhaweshpanwar.xyz)

---

## 🚀 Tech Stack & Key Libraries

**Backend:**

- Node.js
- Express.js
- PostgreSQL with `pg`, `drizzle-orm`
- MVC Architecture
- Nodemailer + Sendgrid (Email Delivery)
- Multer (Image Upload)
- Stripe & Stripe Checkout (Secure Payments)
- Mapbox API (Tour Mapping)
- CORS, Helmet, Rate Limiting, XSS Clean, HPP, Mongo Sanitize
- Cookie-based Auth, JWTs
- Joi (Validation)
- Sharp (Image Processing)
- Mailtrap (Testing Emails)

**Frontend:**

- Server-side rendered pages using Pug (SSR)
- HTML-to-text
- Responsive UI

**Deployment & DevOps:**

- Render (Deployment)
- Nodemon for Dev Mode
- dotenv for Environment Variables

---

## 📸 Screenshots

![Homepage](<screenshots/Screenshot (100).png>)
![Login](<screenshots/Screenshot (101).png>)
![MapBox](<screenshots/Screenshot (102).png>)

---

## 🔐 Features

### 🧑‍💼 Authentication & Users

- Register, login, and logout
- Forgot/Reset password with secure tokens
- User roles: admin, user
- Account settings: change name, photo, password

### 🗺 Tour Booking

- Browse all tours
- View tour details (images, guides, dates, locations)
- Mapbox integration for location visualization
- Book tours with Stripe Checkout

### 🛡 Security

- Helmet for setting security headers
- Express rate limiting (prevents brute force)
- Sanitization against XSS & NoSQL Injection
- JWT authentication with cookie security
- HTTPS-ready server

### 💌 Email Integration

- Nodemailer + Sendgrid for real-time email notifications
- Mailtrap integration for email testing
- HTML email templates using Pug

### 🧰 Admin Features

- Manage tours, users, bookings (coming soon)
- Upload and compress tour images
- Pagination, filtering, and sorting

---

## 📁 Project Structure (MVC)

```
├── controllers/
├── models/
├── routes/
├── views/
├── validations/
├── utils/
├── public/
├── server.js
└── app.js
```

---

## 🔧 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/bhaweshpanwar/natours.git
cd natours
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and add:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
SENDGRID_USERNAME=your_username
SENDGRID_PASSWORD=your_password
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. Run in Development

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 API Endpoints

### Tours

- `GET /api/v1/tours`
- `GET /api/v1/tours/:id`
- `POST /api/v1/tours` _(Admin only)_

### Users

- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `PATCH /api/v1/users/updateMe`

### Bookings

- `POST /api/v1/bookings/checkout-session/:tourId`

---

## 🛍 Packages Used (Partial List)

- **express**
- **cors**
- **pg** & **drizzle-orm**
- **stripe**
- **sendgrid/mail**
- **multer**
- **sharp**
- **nodemailer**
- **helmet**
- **dotenv**
- **validator**
- **bcrypt**
- **xss-clean**
- **cookie-parser**
- **express-rate-limit**
- **slugify**
- **joi**

---

## 📜 License

This project is currently **not licensed**. All rights reserved to the author.

---

## 👨‍💻 Author

**Bhawesh Panwar**
