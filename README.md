# 🌳 Genealogy App

A modern, responsive web application for building, visualizing, and managing interactive family trees. Built with **React**, **Firebase**, and **Lucide Icons**, and hosted with **GitHub Pages**.

[![Deploy to GitHub Pages](https://github.com/Git-esh-Taklikar/genealogy-app/actions/workflows/deploy.yml/badge.svg?branch=gh-pages)](https://git-esh-taklikar.github.io/genealogy-app/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0.0-orange.svg)](https://firebase.google.com/)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blueviolet.svg)](https://git-esh-taklikar.github.io/genealogy-app/)

---

## 🌐 Live Demo

- **Hosted URL**: [https://git-esh-taklikar.github.io/genealogy-app/](https://git-esh-taklikar.github.io/genealogy-app/)
- **Repository**: [https://github.com/Git-esh-Taklikar/genealogy-app](https://github.com/Git-esh-Taklikar/genealogy-app)

---

## ✨ Features

- **Interactive Family Tree**: Visualize hierarchical multi-generation family relationships dynamically.
- **Member Management**: Add, edit, update, and remove family members with modal dialogs and profile details.
- **User Authentication**: Secure user login and registration powered by Firebase Authentication (Email/Password & Phone OTP).
- **Cloud Synchronization**: Real-time cloud persistence using Firebase Cloud Firestore with per-user data isolation.
- **Modern UI & Icons**: Clean, responsive layout crafted with modern CSS and Lucide React icons.
- **One-Command Deployment**: Automated build and release pipeline targeting GitHub Pages.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 18](https://react.dev/)** | Frontend user interface framework |
| **[Firebase 10](https://firebase.google.com/)** | Authentication & Cloud Firestore database |
| **[Lucide React](https://lucide.dev/)** | Lightweight and customizable iconography |
| **[GitHub Pages](https://pages.github.com/)** | Production hosting and distribution |
| **[gh-pages](https://www.npmjs.com/package/gh-pages)** | Automated deployment utility |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v16.0.0 or later recommended)
- **npm** (v8.0.0 or later) or **yarn**
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Git-esh-Taklikar/genealogy-app.git
   cd genealogy-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔐 Firebase Configuration

To enable cloud storage and user authentication:

1. **Create a Firebase Project:**
   - Navigate to the [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and follow the prompts.

2. **Enable Services:**
   - **Authentication**: Enable *Email/Password* and/or *Phone* sign-in providers under **Build > Authentication**.
   - **Firestore Database**: Create a Cloud Firestore database in **production** or **test** mode.

3. **Add Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firestore Security Rules:**
   Ensure each user only has access to their own family trees:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm start` | Runs the app in development mode at `localhost:3000`. |
| `npm run build` | Builds the app for production into the `build/` folder. |
| `npm run deploy` | Builds the project and publishes the latest bundle to the `gh-pages` branch. |

---

## 🚢 Deployment to GitHub Pages

This project is configured to deploy directly to GitHub Pages using the `gh-pages` package:

1. Whenever you make changes and are ready to deploy:
   ```bash
   npm run deploy
   ```
2. The script will automatically:
   - Run `predeploy` (`npm run build`) to produce an optimized production bundle.
   - Commit and push the `build` folder assets to the `gh-pages` branch.
   - Update your live site at **[https://git-esh-taklikar.github.io/genealogy-app/](https://git-esh-taklikar.github.io/genealogy-app/)**.

---

## 📁 Project Structure

```text
genealogy-app/
├── public/
│   └── index.html          # HTML shell and root mount point
├── src/
│   ├── App.jsx             # Main Genealogy application component
│   └── index.js            # React entry point
├── build/                  # Compiled production assets (generated)
├── package.json            # Project dependencies and deployment scripts
├── .gitignore              # Files and directories ignored by Git
└── README.md               # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/Git-esh-Taklikar/genealogy-app/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) (or Private/Proprietary as specified).
