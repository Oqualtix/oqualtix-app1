# Quick Start Guide - Oqualtix App

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd "c:\Users\Ayden\OneDrive\Designs\Oqualtix App"
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Choose Your Platform
- **📱 Phone:** Download Expo Go app and scan QR code
- **💻 Web:** Press 'w' in terminal or run `npm run web`
- **📲 Android:** Press 'a' in terminal (requires Android Studio)
- **🍎 iOS:** Press 'i' in terminal (requires Xcode on macOS)

## 🔐 Demo Login Credentials

### Admin Account (Full Access)
- **Email:** Oqualtix@outlook.com  
- **Password:** OqualtixAdmin2025!

### User Account (Code-Based Access)
- **Email:** Any valid email address
- **Access Code:** DEMO2025 (Demo code - expires in 30 days)
- **Instructions:** Enter your email and the access code provided by admin

### How User Access Works
1. **Admin generates access codes** for new users
2. **Users enter their email + access code** (not password)
3. **System automatically creates account** on first login with valid code
4. **Code becomes single-use** after successful registration

## 🎯 Key Features to Test

### 1. Oxul AI Assistant
- Ask about fraud detection
- Upload financial documents
- Test forensic analysis capabilities

### 2. Financial Tracking
- View transaction timeline
- Use search and filters
- Check financial summaries

### 3. Settings (Admin Only)
- Create new user accounts
- Manage existing users  
- Update profile information

## 🛠️ Development Tips

- Hot reload is enabled - changes appear instantly
- Check terminal for any error messages
- Use Expo DevTools for debugging
- Test on multiple platforms for compatibility

## 📱 Mobile Testing

1. Install Expo Go:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Ensure phone and computer are on same WiFi network
3. Scan QR code from terminal output
4. App will load on your phone

## 💡 Troubleshooting

**Common Issues:**
- **"Module not found"** → Run `npm install`
- **"Metro bundler error"** → Clear cache with `expo start -c`
- **QR code not scanning** → Check WiFi connection
- **Slow loading** → Clear Expo cache in phone settings

**Reset Everything:**
```bash
rm -rf node_modules
npm install
expo start -c
```

---

**Ready to explore your forensic financial analysis app! 🕵️‍♂️💼**