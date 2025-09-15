# Personal Budget Tracker

A simple, modern web application for tracking personal income and expenses. Built with **Next.js**, it helps users monitor their budget, categorize transactions, and visualize financial health over time.

---

## 🚀 Demo

👉 [Live App on Vercel](https://personal-budget-tracker-gilt.vercel.app)

---

## ✨ Features

- ✅ Add, edit, and delete transactions (income & expenses)  
- 📊 Categorize expenses (e.g., food, transport, utilities)  
- 📈 Dashboard with summaries & spending trends  
- 📱 Fully responsive design (mobile & desktop friendly)  

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) – React framework for building fast web apps  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework  
- [Vercel](https://vercel.com/) – Deployment & hosting platform  

---

## 📂 Project Structure

- controllers/ # Business logic / data handling
- lib/ # Utility libraries & helpers
- pages/ # Next.js pages (routes + components)
- pages/api/ # Next.js apis (all the apis)
- public/ # Static assets (icons, images, etc.)
- styles/ # Global & component-specific styles
- .eslint.config.mjs
- next.config.mjs
- postcss.config.mjs
- jsconfig.json
- package.json

---

## ⚡ Getting Started

### 1️⃣ Prerequisites

- Node.js **v14+**  
- npm / yarn / pnpm  

### 2️⃣ Installation

```bash
# Clone the repo
git clone https://github.com/chimt4chi/personal_budget_tracker.git

cd personal_budget_tracker

# Install dependencies
npm install
# or
yarn
# or
pnpm install
```

### Run Locally

```npm run dev```
# or
```yarn dev```
# or
```pnpm dev```

### Now Open ``` http://localhost:3000 ```


## Configuration
### Create a .env.local file for environment variables:
``` 
NEXT_PUBLIC_API_URL=your_api_url_here
NEXT_PUBLIC_ANALYTICS_KEY=your_key_here
```

## Deployment
This project is optimized for Vercel.
To deploy:

#### Push code to GitHub

#### Connect repo to Vercel

#### Set build command: npm run build

#### Start command: npm start

# 🤝 Contributing
Contributions are welcome!
## Fork the repo

## Create a feature branch: ```git checkout -b feat/your-feature```

## Commit changes: ```git commit -m "Add new feature"```

## Push branch: ```git push origin feat/your-feature```

## Open a Pull Request 🚀

# 👤 Author
- Github: @[chimt4chi](https://github.com/chimt4chi)
- Live Demo: [Link](https://personal-budget-tracker-gilt.vercel.app/auth/login)