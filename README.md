# TradeOff App

TradeOff is a multi-platform expense tracking and transaction management application developed as part of the IT342 course project.  
The system consists of a web platform, a mobile application, and a backend REST API.

---

## Project Overview

TradeOff helps users manage expenses, record transactions, and monitor spending through a unified system accessible via both web and mobile platforms.

The application is composed of three major components:

- Web Application (React)
- Mobile Application (Android Kotlin)
- Backend API (Java Spring Boot)

---

## Features

- User authentication and account management
- Expense and transaction tracking
- Cross-platform accessibility through web and mobile
- Backend REST API integration
- Organized repository structure for full-stack development

---

## Technology Stack

### Backend
- Java (Spring Boot)
- REST API
- Maven or Gradle

### Web Application
- React.js
- JavaScript
- Axios for API requests

### Mobile Application
- Kotlin
- Android Studio
- Retrofit for API integration

---

## Repository Structure

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/anirak411/IT342_G5_Najarro_Lab1
cd IT342_G5_Najarro_Lab1
````
Backend Setup (Java)
1. Open the backend/ folder using IntelliJ IDEA or another Java IDE
2. Install dependencies:

````
mvn clean install
````
3. Run the backend server:
````
mvn spring-boot:run
````
The backend will run at:
````
http://localhost:8080
````
## Web Application Setup (React)
Navigate to the web folder:
````
cd web
````
Install required packages:
````
npm install
````
Start the React development server:
````
npm start
````
The web application will run at:
````
http://localhost:3000
````
---

### Mobile Application Setup (Android Kotlin)
1. Open the mobile/ folder in Android Studio
2. Sync Gradle files
3. Run the application using an emulator or physical Android device

Ensure that the backend server is running for API connectivity.

---

### Git Ignore Notes
Unnecessary system and IDE files such as .idea/ and .DS_Store are excluded from version control using the .gitignore file.

---

### Contributors
IT342 - G5 
Project Members: Monica A. Najarro
