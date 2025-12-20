
# The Cat App 😺

A modern web app to manage, vote on, and favourite cat images. Users can upload their own cats, browse random cats, vote 👍 / 👎, and save favourites 💚. Built with React, TypeScript, and HeroUI components.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Future Improvements](#future-improvements)

---

## Features

- Display a gallery of cat images with voting functionality. 
- Upload your own cat images (.jpg, .jpeg, .png, .gif).
- Favourite/unfavourite cat images with instant feedback.
- Success alerts auto-dismiss after 3 seconds; warning alerts are dissmissable.
- Modal with app instructions and helpful tips.
- Responsive grid layout for desktop and mobile.
- Accessibility support: ARIA lables, alt text for images. 
- Error handling and input validation for uploads and actions. 

---

## Tech Stack

- **Frontend:** React, TypeScript
- **UI Components:** HeroUI
- **Routing:** React Router Demo
- **API:** [The Cat API](https://thecatapi.com/)
- **Styling:** Tailwind CSS
- **State Management:** React `useState` and `useEffect`

---

## Set up 

1. Clone the repository: 

```bash
git clone https://github.com/heaji-lee/waracle-cat-app.git
cd waracle-cat-app
```

2. Install dependencies:

```bash
npm install 
# or 
yarn install
```

3. Create a `.env` file with your Cat API key:

```env
VITE_CAT_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

This app will run at `http://localhost:5173` (or the port you Vite config specifies).

---

## Usage

- Click the **Need Help?** button in the navigation to open instructions.
- Click **Upload a Cat** to add your own image. 
- Click the ❤️ heart to favourite or unfavourite a cat. 
- Use the 👍 / 👎 buttons to vote on cats.
- Alerts show feedback for your actions.
- Navigagte between Home, Upload, and Favourites via the sidebar. 

---

## Folder Structure

- `src/`
  - `api/` — API calls for cats, votes, favourites
  - `assets/` — Images and sound
  - `components/` — Reusable components (HelpModal, etc.)
  - `pages/` — Pages (Home, Moo, Upload, Favourite)
  - `App.tsx` — Main app component with routing
  - `main.tsx` — Entry point
  - `constants.ts` — App-wide constants
  - `index.css` — Global styling across the app

---

## Future Improvements

- Skeleton loaders for image fetching. 
- Dark mode toggle for better UX.
- Implement pagination when fetching cats.
- More responsive on various screen sizes.
- Search page to search for a cat image based on parama.

