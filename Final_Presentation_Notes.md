# TimeQueue: Final Project Presentation
**Time Limit:** 12-15 Minutes Total (7-12 min demo, 2-3 min Q&A)

## Slide 1: Title Slide
*   **Title:** TimeQueue - Smart Appointment Booking
*   **Subtitle:** CSC 4370 Final Project
*   **Visual:** Title of the project, your name(s), and course information.

## Slide 2: Project Overview (Content)
*   **What is TimeQueue?** A comprehensive booking platform designed to simplify appointment scheduling for both hosts (service providers) and standard users.
*   **Core Problem Solved:** Eliminates the frustration of manual scheduling and seamlessly manages high demand via an automated waitlist system.
*   **Key Features:** 
    * Secure user registration and authentication handled by JWT.
    * Host dashboard for creating capacity-controlled appointment slots.
    * Real-time waitlist and automated shift promotions.

## Slide 3: Project Overview (Tech Stack)
*   **Architecture:** Client-Server Model
*   **Frontend (Client):** 
    * **Vue.js 3** & **Vite** for a fast, reactive Single Page Application (SPA).
    * **Pinia** for centralized state management.
    * **Vue Router** for seamless navigation.
*   **Backend (Server):** 
    * **Node.js** & **Express.js** for robust API routing and logic.
*   **Database:**
    * **SQLite** for lightweight, persistent data storage.

## Slide 4: Greatest Strengths & Polished Features
*   **Intelligent Auto-Fill Waitlist:** This is the crown jewel. If a booked user cancels their appointment, the system automatically checks the waitlist queue, removes the earliest person (FIFO algorithm), and automatically books them into the now-empty slot.
*   **Robust Security:** Implemented `bcrypt` for password hashing to protect user data, and JSON Web Tokens (JWT) for secure, stateless API authentication.
*   **Reactive User Interface:** Using Vue 3 Composition API to instantly update UI elements (like available slots and custom modals) without page reloads.

## Slide 5: Areas for Improvement & Optimization
*   **Email/SMS Notifications:** Currently, the waitlist promotion happens silently on the backend. Adding an integration like SendGrid to automatically email promoted users would elevate the UX.
*   **Advanced Date/Time Filtering:** Adding a calendar UI component (like V-Calendar) to allow users to filter slots by specific days or weeks.
*   **Database Migration:** Upgrading from local SQLite to a production-ready database like PostgreSQL if deployed to cloud hosting.

## Slide 6: Utilization of Large Language Models (LLMs)
*   *Customize this based on your actual experience:*
*   "During this project, we leveraged AI assistants primarily for **code structuring and debugging**."
*   "LLMs were instrumental in helping us architect the complex 'waitlist auto-fill' logic and translating our database schema into efficient SQLite queries."
*   "We also used LLMs to help debug CORS connection issues between our Vue frontend and Express backend."

---

## 🎤 Demo Script (7-12 Minutes)

**1. Introduction (1 min)**
*   Welcome the class. Give a 30-second elevator pitch of TimeQueue.

**2. The Host Perspective (2 mins)**
*   Open the app. Log in as a 'Host' account.
*   Show the **Host Dashboard**. 
*   **Action:** Create a brand new time slot for tomorrow with a *Capacity of 1*. Explain that normally this would be higher, but we want to demonstrate the waitlist.

**3. The User Booking Flow (3 mins)**
*   Open an Incognito window or use a different browser.
*   Register a brand new user (User A) to show the registration flow works.
*   Go to the **Slots Page**. Show the slot we just created.
*   **Action:** Click 'Book'. 
*   Show the **My Bookings Page**. Point out that User A is successfully booked.

**4. The Waitlist Trap (2 mins)**
*   Log out and log in as a *third* account (User B).
*   Go back to the same Slots Page. 
*   **Action:** Attempt to book the *exact same slot*.
*   Show the notification/modal that says the slot is full and they've been placed on the waitlist. Show User B's dashboard confirming their waitlist status.

**5. The Auto-Fill Magic (2 mins)**
*   Go back to User A (the one holding the confirmed slot).
*   **Action:** Cancel User A's appointment.
*   Go back to User B's screen and hit refresh.
*   **The Reveal:** Show that User B has magically been promoted from the Waitlist into a Confirmed Booking! Explain the backend logic that made this happen.

**6. Conclusion & Transition to Q&A (1 min)**
*   Thank the audience.
*   "This concludes our demo of TimeQueue. We're now open to any questions!"
