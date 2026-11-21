# COMMUNITY WASTE MANAGEMENT SYSTEM

## 1. Project Description
The Community Waste Management System is a web-based application designed to manage waste collection activities through three user roles: Administrator, Resident and Collector.

## 2. Technologies Used
- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB Community Server
- Mongoose
- JWT Authentication

## 3. System Requirements
Before running the application, ensure the computer has:
- Node.js installed.
- MongoDB Community Server installed.
- MongoDB Database Tools installed.

## 4. Installation and Setup

1. Download or extract the project folder.
2. Ensure MongoDB Community Server is installed and running.
3. Open the project folder.
4. Run `RESTORE DATABASE.bat` to restore the supplied database backup.
5. Run `START SYSTEM.bat` to start the application.
6. The login page will open automatically in the browser.

## 5. User Roles

### Administrator
- Manage residents.
- Manage collectors.
- Manage vehicles.
- Manage waste requests.
- Manage collection schedules.
- View registered users.

### Resident
- Register and log in.
- Submit waste collection requests.
- View submitted requests and their statuses.

### Collector
- Log in.
- View assigned waste collection requests.
- Mark completed collections.

## 6. Accessing the Application

After starting the system, open:

http://localhost:5000/index.html

Keep the server running while using the application.

## 7. Database

Database name: `CommunityWasteManagement`

Collections:
- residents
- collectors
- vehicles
- users
- wasteRequests
- schedules

The database backup is provided in the `database-backup` folder.

## 8. Project Structure

- `backend/` – Server, routes, controllers, models and database configuration.
- `frontend/` – User interface files.
- `database-backup/` – MongoDB database backup.
- `START SYSTEM.bat` – Starts the application by double tap in file explorer.
- `RESTORE DATABASE.bat` – Restores the database.
- `package.json` – Project dependencies and scripts.