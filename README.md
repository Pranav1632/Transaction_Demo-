

# 📦 Transaction App — MERN

### 🔐 Phone/Email Authentication + 🔄 Magic Link + 📱 OTP Login + 💖 Razorpay Donation System (UPI/Cards/Wallets)

This project is a complete **authentication + payment** system built using the **MERN stack**.
It supports **phone OTP login (Twilio Verify)**, **email magic-link login**, and a secure **Razorpay donation workflow** (Cards, UPI, Wallets).

Designed for production-grade reliability with **webhook verification**, **JWT/cookie auth**, **rate-limiting**, and **modular architecture**.

---

## 🚀 Features

### 🔐 **Authentication**

| Method                   | Details                                   |
| ------------------------ | ----------------------------------------- |
| 📱 **Phone OTP Login**   | Using Twilio Verify API                   |
| ✉️ **Email Login**       | Magic Link + optional OTP fallback        |
| 🔄 **Link Both Methods** | Users can link phone ↔ email              |
| 🛡️ **Secure Design**    | JWT token / future cookie session support |
| ⏱️ **Rate-Limited**      | Per IP + per target                       |

### 💖 **Payment System (Razorpay)**

| Feature                                | Details                                        |
| -------------------------------------- | ---------------------------------------------- |
| 🧾 **Donation Creation**               | Server-side Razorpay order creation            |
| 📱 **UPI, Cards, Wallets, NetBanking** | Full Razorpay Checkout                         |
| 🔄 **Webhook Verification**            | Source-of-truth payment confirmation           |
| 📊 **Dashboard Status**                | Shows donation history & user profile          |
| 📦 **Designed for Extensions**         | Invoices, email receipts, refunds, admin panel |

---

## 🧱 Tech Stack

### **Frontend**

* React (Vite)
* Axios
* Tailwind-ready components
* Razorpay Checkout Integration

### **Backend**

* Node.js + Express
* MongoDB + Mongoose
* Twilio (OTP)
* Nodemailer (magic link)
* Razorpay Orders API
* Raw webhook handling (HMAC SHA256)

### **Security**

* Helmet
* Rate Limiting
* CORS (with credentials)
* JWT tokens (migratable to httpOnly cookies)
* Webhook signature verification

---

# 📁 Folder Structure

```
transaction/
│── backend/
│    ├── src/
│    │   ├── app.js
│    │   ├── server.js
│    │   ├── routes/
│    │   ├── controllers/
│    │   ├── models/
│    │   ├── utils/
│    │   └── middleware/
│    ├── .env.example
│    └── package.json
│
│── frontend/
│    ├── src/
│    │   ├── pages/
│    │   ├── components/
│    │   ├── context/
│    │   ├── api/
│    │   └── App.jsx
│    ├── public/
│    ├── .env.example
│    └── package.json
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repo

```bash
git clone https://github.com/your-username/transaction.git
cd transaction
```

---

## 2️⃣ Install Frontend & Backend

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 3️⃣ Environment Configuration

Fill the `backend/.env` with:

```
PORT=4000
FRONTEND_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/transaction_dev

JWT_SECRET=change_me_secure
VERIFICATION_TOKEN_SECRET=change_me_secure_2

# Twilio (phone OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# SMTP (email magic link)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password-here
EMAIL_FROM=your@gmail.com

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
WEBHOOK_SECRET=
```

Fill the `frontend/.env` with:

```
VITE_API_BASE=http://localhost:4000
```

---

# 💳 Razorpay Webhook Setup

1. Run backend + ngrok:

```bash
ngrok http 4000
```

2. Use:

```
https://<your-ngrok>.ngrok.io/webhooks/razorpay
```

3. Enable events:

* `payment.captured`
* `payment.authorized`
* `payment.failed`

4. Paste your **WEBHOOK_SECRET** in Razorpay Dashboard & `.env`

---

# 🔥 Usage Flow

### **User Login**

1. User selects Phone or Email
2. Enters number/email
3. Receives OTP or Magic Link
4. Verifies → Redirects to Dashboard

### **Donation Workflow**

1. User taps **Donate**
2. Enters amount
3. Razorpay Checkout opens
4. Payment processed
5. Webhook confirms payment → DB updated
6. Dashboard reflects status

---

# 🛡️ Security Notes

* `.env` is **NOT committed** — use `.env.example`
* JWT secrets should be long, random strings
* Webhook must use `express.raw()` to verify signature
* Rotate secrets if ever exposed
* Never use test keys in production
* Add 2FA to Twilio, Razorpay, GitHub

---

# 🚀 Deployment Ready

* Backend deployable on Render / Railway / AWS EC2
* Frontend deployable on Netlify / Vercel
* Ensure CORS & credentials match domain

---

# 🧩 Future Enhancements (Optional)

* 80G donation receipt PDF
* Admin panel (donor export, filters)
* Razorpay Subscriptions (recurring donations)
* Cookie-based sessions instead of JWT
* Mobile responsive design
* Email notification on successful donation

---

# 🤝 Contributing

Pull requests are welcome.
Please open an issue first to discuss your proposed changes.

---

# 📜 License

MIT License.

---

# 🎉 Acknowledgements

* Twilio Verify
* Razorpay APIs
* React + Vite
* MongoDB Atlas

---

