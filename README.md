# User Registration Web Application

This project is a client-server web application for user registration and authentication. It is implemented **without using any web frameworks**, fully from scratch.  

## Features

The application includes the following functionalities:

- **User Registration Form**  
  - Data validation for email, first name, last name, and password.
  - Password confirmation.
  - CAPTCHA implemented in code (no external services used).
  
- **Login / Logout**  
  - Secure authentication.
  
- **Profile Management**  
  - Change first name, last name, email, and password.

- **Database Integration**  
  - Data stored in a relational database (PostgreSQL).

- **Unit Testing**  
  - 100% coverage of all functions.

- **Web Interface**  
  - Responsive and user-friendly design.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (vanilla)  
- **Backend**: Plain JavaScript (Node.js)  
- **Database**: PostgreSQL  
- **Testing**: Built-in unit testing frameworks (100% function coverage)  

This project demonstrates how to implement a fully functional client-server system using only basic web technologies.

## Implementation Details

- **Data Validation**:  
  Implemented in JavaScript for client-side validation and in backend code for server-side security.
  
- **Database Storage**:  
  Each user is stored with `email`, `first_name`, `last_name`, and hashed `password`.
  
- **Authentication**:  
  Login and logout sessions managed with cookies or server-side session storage.

- **CAPTCHA**:  
  Simple code-generated CAPTCHA integrated into the registration form to prevent bots.

- **Unit Tests**:  
  Every function is covered, including validation, database interactions, and authentication.

## Project Structure
/project-root
│
├── index.html # Login page
├── register.html # Registration page
├── global.css # Global styles and themes
├── js/
│ ├── validation.js # Form validation logic
│ ├── theme.js # Theme toggling
│
├── backend/ # Backend code for handling requests
│ ├── database.js # DB connection and queries
│ ├── auth.js # Login, logout, session management
│ ├── register.js # Registration logic including CAPTCHA
│
└── tests/ # Unit tests for backend functions


## How to Run

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Configure the database connection in backend/database.js.
3. Start the backend server:

```bash
# Example for Node.js
node backend/server.js
```

4. Open index.html in your browser to access the login page.
5. Run unit tests:

```bash
# Example for Node.js using Jest
npm test
```

Notes
- No external frameworks or code generators are used.
- Fully functional client-server system with web interface, database, and CAPTCHA.
- Designed for educational purposes and small-scale deployments.
