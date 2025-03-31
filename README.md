# Group 4312 U.S. Army Equipment Maintenance Intake System Project Overview
The U.S. Army currently relies on a manual, paperwork-based process to conduct vehicle and equipment maintenance tasks, particularly for operator-level checks and troubleshooting. This process is inefficient, prone to data loss, and lacks visibility and traceability throughout the maintenance workflow. Operators need a more streamlined and accurate method to report vehicle deficiencies and initiate maintenance actions, which are currently not facilitated by any digital intake platform, while leaders need oversight of the process to identify gaps and inefficiencies contributing to readiness deficiencies. Project Objectives

1. Digitize Maintenance Processes: Develop a digital system that replaces the manual paperwork process, enabling operators to report deficiencies electronically and enhancing the overall efficiency of vehicle maintenance tasks.

2. Improve Data Capture and Flow: Create a platform where operators can input detailed information about vehicle issues, which is then tracked and managed through a digital workflow. Incorporate existing maintenance checklists to drive deficiency intake.

3. Enhance Visibility and Oversight: Provide a dashboard for key stakeholders to monitor maintenance workflows, from issue reporting to resolution, ensuring transparency and accountability.

4. Facilitate Efficient Maintenance Actions: Streamline the process of identifying, validating, and addressing vehicle faults, with integrated support for parts ordering. (parts ordering is a stretch capability)

Proposed Solution:

Develop a web and mobile application that allows operators to log vehicle deficiencies digitally, track maintenance progress, and facilitate efficient communication and action between operators, technicians, supervisors, and logistics specialists. The solution will include:

1. Operator Interface:

- Task Identification: Automatically present operator-level tasks based on vehicle model.

- Deficiency Reporting: Enable operators to annotate deficiencies, specifying details of the issue.

- Digital Input: Provide a user-friendly interface for logging faults, which automatically populates the maintenance system.

2. Maintenance Workflow Management:

- Action Queue: Route deficiencies to maintenance technicians for validation and corrective actions.

- Supervisor Oversight: Allow supervisors to validate actions, order parts, and manage workflow progress.

- Integration: Align tasks with inventory systems for parts ordering and availability checks.

3. Dashboard and Reporting:

- Process Monitoring: Dashboard providing visibility into the maintenance process for stakeholders.

- Metrics and Analytics: Track metrics such as man-hours, fault resolution time, and process efficiency.

- Role-Based Access: Ensure visibility and data access based on user roles and permissions.

4. Future Scope Enhancements:

- Advanced Troubleshooting: Develop deeper integration for identifying parts and actions based on fault analysis.

# Release Notes

## Version 0.4.04 Release Notes

### New Features
- Implemented functionality to allow supervisors to assign maintainence tasks to maintainers
- Implemented undo functionality for fault submissions
- Implemented simple parts inventory system
- Implemented fault editing capabilites
- Implemented functionality to allow for pictures to be attached to each fault

### Bug Fixes
- Changed faults to present each issue as its own fault

## Version 0.3.0 Release Notes

### New Features
- Implemented functionality to allow maintainers to claim faults as their own
- Implemented functionality to allow maintainers to change the status of their claimed faults
- Implemented a dashboard for operators to view faults on their vehicles
- Implemented to part order process for supervisors to order and maintainers and operators to see ordered parts
- Implemented the entire 5988 PMCS form process for two vehicles provided to us by our client

### Bug Fixes
- Fixed bug where user type was not displayed on login

## Version 0.2.0 Release Notes

### New Features
- Implemented a role-specific home screen for all users to be directed to upon log in
- Implemented a supervisor dashboard to track maintenance tasks
- Implemented supervisor account authorization functionality
- Refactored log in and sign up UI
- Added copyright information and NOTICE file for attributions

### Bug Fixes
- Fixed bug where operators and maintainers were unable to see buttons
- Removed unnecessary schema and backend code for "people"

## Version 0.1.0 Release Notes

### New Features
- Implemented a User Interface to allow users (operators, maintainers, supervisors, etc.) to log in
- Refined the 5988 form to allow vehicle operators to submit faults with vehicles
- Implemented the ability for anybody to create an account
- Database has been setup to store the login information via MongoDB
- Login button is able to verify correct credentials with database

### Bug Fixes
- Fixed bug of the option to view previously submitted 5988 not displaying underneath the 5988 form


## Version 0.0.0 Release Notes
### Features
- MERN CRUD Operations: The core of this application, allowing for full management of database entries.
- Interactive UI: A React-based front end that provides a responsive and engaging user experience.
- Guided 5988 Form: The form that allows vehicle operators to log issues with their vehicles
- Vehicle Issues Database: A skeleton database that stores the issues logged by operators

### Application CRUD Operations
- Create: Add new entries to the database.
- Read: View all the entries in a user-friendly interface.
- Update: Edit existing entries.
- Delete: Remove unwanted entries.

### Technologies Used
Frontend:
- React.js: A JavaScript library for building user interfaces.
- Redux Toolkit: Advanced state management for React applications.
- Toastify: For displaying elegant notifications.

Backend:
- Node.js: JavaScript runtime environment.
- Express: Web application framework for Node.js.
- MongoDB: NoSQL database for storing data.

### Bug Fixes
- None in this release

### Known Issues
- None in this release

### Installation
To run the app you need to have Node.js installed and follow these steps:
1. Download the repository locally or clone it:


```
git clone https://github.com/Kuzma02/Simple-MERN-App.git
```

2. Open terminal in the repository folder:

```
cd folder-name
```

3. Install backend dependencies

```
npm install
```

4. Install frontend dependencies:

```
cd client
npm install
```

5. Configure MongoDB:
Create account on MongoDB, create database and put MONGO_URI in .env file.
Create a .env file in the root directory and add your MongoDB URI:

```
MONGO_URI=your_mongodb_uri
```

6. Run the application:

```
node app.js
```

7. In a new terminal, start the frontend:

```
cd client
npm run dev
```

