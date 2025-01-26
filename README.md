User Management Dashboard
Project Overview
A full-stack User Management Dashboard with Node.js backend and React.js frontend, featuring user authentication, registration, and CRUD operations.
Technologies Used

Backend:

Node.js
Express.js
SQLite3
JSONWebToken (JWT)
Bcrypt


Frontend:

React.js (Class Components)
js-cookie for authentication
Fetch API for HTTP requests



Prerequisites

Node.js (v14 or later)
npm (v6 or later)

Installation
Backend Setup

Clone the repository
Navigate to backend directory
Install dependencies:

bashCopynpm install express sqlite3 bcrypt jsonwebtoken cors

Start the server:

bashCopynode app.js
Frontend Setup

Navigate to frontend directory
Install dependencies:

bashCopynpm install react react-dom js-cookie

Start the React development server:

bashCopynpm start
Configuration

Modify JWT_SECRET in app.js for production
Adjust database path if needed

API Endpoints

/register: User registration
/login: User authentication
/users: CRUD operations for users

GET: Retrieve all users
POST: Create new user
PUT: Update existing user
DELETE: Remove user



Security Features

Password hashing with bcrypt
JWT-based authentication
Protected routes

Known Limitations

In-memory SQLite database
Basic error handling
No advanced validation

Future Improvements

Implement more robust validation
Add role-based access control
Enhance error handling
Implement refresh tokens
Add more comprehensive logging
