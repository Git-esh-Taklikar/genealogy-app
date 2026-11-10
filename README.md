# Genealogy App Deployment Guide

To get your permanent, shareable web link, your cloud infrastructure team needs to follow these steps:

1. Create a Firebase Project at https://console.firebase.google.com
2. Enable Firestore Database and Authentication (Email/Password & Phone OTP)
3. Update Firestore Security Rules to separate users:
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
4. Run `npm install` and `npm run start` to test locally.
5. Deploy to Vercel, Netlify, or Firebase Hosting to generate the final shareable web link.
