# Dr. Katiuscia Therapy - Online Therapy Platform

## 🌟 Overview
Professional online therapy booking and management platform for Dr. Katiuscia Mercogliano. Built with Next.js, featuring secure payment processing, automated scheduling, and Google Workspace integration.

## ✨ Features

### Patient Features
- 🌐 **Bilingual Support** (English/Italian)
- 💳 **Secure PayPal Integration** for session packages
- 📅 **Automated Booking System** with personal booking links
- 📹 **Google Meet Integration** for video sessions
- 📋 **HIPAA-Compliant Medical Forms**
- 📧 **Automated Email Confirmations** and reminders
- 📦 **Multi-Session Packages** (1, 4, or 6 sessions)

### Admin Features
- 🔐 **Secure Admin Dashboard**
- 📊 **Google Calendar Integration**
- 📈 **Booking Management System**
- 🔒 **Encrypted Data Storage**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Payment**: PayPal SDK
- **Authentication**: Custom secure token system
- **APIs**: Google Workspace (Gmail, Calendar, Meet)
- **Data Storage**: CSV with encryption
- **Deployment**: Hetzner Server / Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google Workspace account with APIs enabled
- PayPal Developer account
- Domain with SSL certificate

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/BGomes2022/doctor-k-therapy.git
cd doctor-k-therapy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password

# Google Workspace Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
DOCTOR_EMAIL=dr.k@yourdomain.com
DOCTOR_CALENDAR_ID=dr.k@yourdomain.com

# Environment Settings
MOCK_GOOGLE_APIS=false
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 4. Google Service Account Setup
1. Create a service account in Google Cloud Console
2. Enable Gmail, Calendar, and Meet APIs
3. Set up Domain-Wide Delegation
4. Place the service account JSON key in `/keys/` directory

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Production Deployment

### Using Hetzner Server

1. **Server Setup**
```bash
ssh root@your-server-ip
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs nginx
npm install -g pm2
```

2. **Deploy Application**
```bash
cd /var/www
git clone https://github.com/BGomes2022/doctor-k-therapy.git
cd doctor-k-therapy
npm install
npm run build
```

3. **Start with PM2**
```bash
pm2 start npm --name "therapy-app" -- start
pm2 startup
pm2 save
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **SSL with Let's Encrypt**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### Using Vercel (Alternative)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BGomes2022/doctor-k-therapy)

## 📁 Project Structure

```
doctor-k-therapy/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── booking/           # Booking flow pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── BookingFlow.tsx    # Main booking workflow
│   ├── MedicalForm.tsx    # Patient intake form
│   └── CalendarBooking.tsx # Session scheduling
├── utils/                 # Utility functions
│   ├── googleWorkspace.js # Google APIs integration
│   ├── csvHelpers.js      # Data management
│   └── encryption.ts      # Security utilities
├── public/               # Static assets
│   └── images/           # Images and media
└── keys/                 # Service account keys (gitignored)
```

## 🔒 Security Features

- **Encrypted Medical Data**: AES-256-GCM encryption for sensitive information
- **HIPAA Compliance**: Secure data handling and storage
- **SSL/TLS**: Enforced HTTPS connections
- **Token-Based Access**: Secure booking tokens with expiration
- **Environment Variables**: Sensitive data kept out of codebase

## 📝 Data Management

The application uses CSV files for data storage with the following structure:
- `booking-tokens.csv`: Manages session packages and access tokens
- `bookings.csv`: Stores individual session bookings
- Medical data is encrypted before storage

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start
```

## 📧 Email Templates

The system includes automated email templates for:
- Booking confirmations
- Session reminders (24 hours before)
- Personal booking links
- Payment confirmations

## 🌍 Domain Configuration

### DNS Settings (Google Domains or other provider)
```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

## 🆘 Troubleshooting

### Google APIs not working
- Verify Domain-Wide Delegation is configured
- Check service account permissions
- Ensure APIs are enabled in Google Cloud Console

### Payment issues
- Verify PayPal credentials
- Check sandbox vs production mode
- Ensure correct currency settings

### Email delivery
- Check spam folders
- Verify DOCTOR_EMAIL is correct
- Confirm Gmail API is enabled

## 📄 License

Private repository - All rights reserved © 2024 Dr. Katiuscia Mercogliano

## 👨‍💻 Developer

Developed by Ben Gomes for Dr. Katiuscia Mercogliano

## 📞 Support

For technical issues, please contact the developer.
For therapy inquiries, visit [doctorktherapy.com](https://doctorktherapy.com)

---

**Note**: This is a private therapy practice application. Please ensure all HIPAA compliance requirements are met before handling patient data.