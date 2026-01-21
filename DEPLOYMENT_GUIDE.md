# 🚀 Professional Deployment Guide: YouTube 2.0

To get your project live with a URL like `https://you-tube2-0.vercel.app`, you need to deploy the **Backend** and **Frontend** separately.

---

## 1️⃣ Deploy the Backend (Server)
I recommend using **Render.com** for the Express server.

1.  Create a [Render.com](https://render.com) account and click **New > Web Service**.
2.  Connect your GitHub repository.
3.  Set the following settings:
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  **Environment Variables**: Add all variables from your `server/.env`:
    *   `DB_URL`: (Your MongoDB Connection String)
    *   `EMAIL_USER`: (Your Gmail email)
    *   `EMAIL_PASS`: (Your Gmail App Password)
    *   `RAZORPAY_KEY_ID`: (Your Razorpay Key)
    *   `RAZORPAY_KEY_SECRET`: (Your Razorpay Secret)
5.  **Get the URL**: Once deployed, Render will give you a URL like `https://youtube-backend-xxxx.onrender.com`.

---

## 2️⃣ Deploy the Frontend (Vercel)
Use **Vercel.com** for the Next.js frontend.

1.  Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
2.  Select your GitHub repository.
3.  Set the following settings:
    *   **Root Directory**: `yourtube`
    *   **Framework Preset**: `Next.js`
4.  **Environment Variables**: Add the following:
    *   `NEXT_PUBLIC_BACKEND_URL`: Paste the **Render URL** you got in Step 1.
    *   `NEXT_PUBLIC_RAZORPAY_KEY`: (Your Razorpay Public Key)
5.  **Deploy**: Click **Deploy**. Vercel will give you your custom URL!

---

## ⚠️ Important Production Tips
*   **Google Auth**: If you use Google Login, update your **Authorized Redirect URIs** in Google Cloud Console to include your new Vercel URL.
*   **Razorpay**: Add your Vercel URL to the Razorpay Dashboard's allowed domains if required.
*   **CORS**: Your backend currently allows all origins (`origin: true`), so it will work with Vercel automatically.

---
*Created by Antigravity AI*
