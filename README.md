<div align="center">

  <h1>✈️ ApexVoyage</h1>
  <p><strong>A sleek travel booking platform built for fast, hassle-free trip planning.</strong></p>

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**ApexVoyage** is a modern, full-stack travel booking web application designed to eliminate the friction of travel planning. By leveraging **React**, **Node.js**, and high-performance third-party APIs, ApexVoyage brings real-time flight searches, hotel reservations, and custom itinerary building into a unified, lightning-fast dashboard.

---

## ✨ Key Features

* 🛫 **Real-Time Flight Search:** Query live flight options across multiple airlines with dynamic pricing and filter options (duration, layovers, price).
* 🏨 **Hotel Booking Engine:** Explore accommodations with interactive map integration, photo galleries, and guest reviews.
* 🗓️ **Custom Itinerary Planner:** Organize flights, hotel stays, and daily activities into a clean, day-by-day travel timeline.
* 💳 **Secure Checkout Flow:** Integrated payment simulation complete with booking confirmation receipts and instant PDF tickets.
* 📱 **Mobile-First Design:** Fully responsive UI built with Tailwind CSS for seamless booking on mobile, tablet, or desktop.
* ⚡ **Optimized Performance:** Fast API responses backed by caching mechanisms for high-frequency queries.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | [React](https://react.dev/) | Component-driven UI library |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first responsive design |
| **Backend** | [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) | RESTful API server & request orchestration |
| **Database** | [MongoDB](https://www.mongodb.com/) / [PostgreSQL](https://www.postgresql.org/) | User profiles, bookings, & saved itineraries |
| **APIs** | Amadeus / Skyscanner / Google Maps | Live travel data, place details, and interactive maps |

---

## 📂 Project Structure

```text
apex-voyage/
├── 📁 client/                # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 assets/        # Images, SVG icons, static media
│   │   ├── 📁 components/    # Navigation, FlightCard, HotelGrid, SearchBar
│   │   ├── 📁 hooks/         # Custom React hooks (useFetch, useBooking)
│   │   ├── 📁 pages/         # Home, FlightResults, HotelDetails, Itinerary, Profile
│   │   ├── 📁 services/      # Axios API client instances
│   │   ├── App.jsx           # Client routes and layout wrapper
│   │   └── main.jsx         # React application root entry
│   └── package.json
│
├── 📁 server/                # Node.js / Express Backend API
│   ├── 📁 config/            # DB connection & API configurations
│   ├── 📁 controllers/       # Flight, Hotel, Booking, & Auth logic
│   ├── 📁 middleware/        # JWT Authentication & Error handling
│   ├── 📁 models/             # Database Schemas (User, Booking, Itinerary)
│   ├── 📁 routes/             # Express route endpoints
│   └── server.js             # Express app entry point
│
├── .env.example              # Environment variable template
├── .gitignore
└── README.md
