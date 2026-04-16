# DineQueue: Final Project Report
**Course:** CSC 4370  
**Date:** May 2, 2026  

## 1. Introduction
Scheduling appointments and managing sudden cancellations is a historically tedious process for both service providers and clients. The goal of this project was to develop **DineQueue**, a robust, full-stack appointment booking application designed to automate away these friction points. 

DineQueue was built to allow "Hosts" (administrators or service providers) to easily generate time slots with specific capacity limits, while allowing standard users to browse and reserve those times. To solve the issue of high-demand slots and lost revenue from last-minute cancellations, the core objective of DineQueue evolved to include an automated, intelligent waitlist system that operates entirely behind the scenes without manual intervention.

## 2. Project Outcomes & Functionality Achieved
The final product successfully implements a complete Client-Server architecture, utilizing Vue.js 3 and Vite for a highly reactive frontend design, alongside a Node.js and Express.js backend API, supported by a persistent SQLite database.

We successfully achieved the following core functionalities:

*   **Role-Based Access Control:** The SQLite database securely stores user data utilizing `bcrypt` password hashing. Upon login, the system generates JSON Web Tokens (JWT) to establish a stateless, secure session, differentiating between standard "Users" and administrative "Hosts" to restrict access to specific dashboards.
*   **Dynamic Slot Generation:** Hosts can utilize the `HostDashboardPage.vue` interface to instantly generate capacity-controlled appointment windows, which are immediately broadcasted to the public `SlotsPage.vue`.
*   **Intelligent Auto-fill Waitlist:** This represents the pinnacle technical achievement of the project. If a user attempts to book a slot that has reached its maximum capacity limit in the `bookings` table, the Express backend automatically diverts them to a `waitlist` table, timestamping their entry. If a confirmed user later deletes their booking, the backend triggers a First-In, First-Out (FIFO) algorithm. It queries the waitlist, extracts the earliest queued individual, and automatically promotes them into the now-vacant `bookings` table, ensuring slots remain fully utilized without requiring manual host approval.

## 3. Future Updates & Improvements
While the foundational logic of DineQueue is structurally sound, there are several key avenues for future optimization:

1.  **Automated Notifications:** Currently, the waitlist promotion happens silently within the database. A critical next step would be integrating a service like SendGrid or Twilio to automatically dispatch an Email or SMS to the promoted user, alerting them that they have secured the appointment.
2.  **Advanced UI Filtering:** As the database of slots grows, the `SlotsPage.vue` will become difficult to navigate. Implementing a visual calendar component (such as V-Calendar) would allow users to filter availability by specific days, weeks, or individual hosts.
3.  **Database Migration:** For a true production deployment, migrating the data layer from a local SQLite file to a robust, scalable relational database like PostgreSQL hosted on AWS or Supabase would be necessary to handle concurrent, high-volume transactions safely.

## 4. Course Feedback
*[Note to Student: Please write your genuine, personal feedback for Professor Lan regarding the structure of the course, what you enjoyed, and what could be improved here before submitting!]*
