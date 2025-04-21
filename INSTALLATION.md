# Installation Guide - U.S. Army Equipment Maintenance System

## Pre-requisites

Before installing this application, ensure your system meets the following requirements:

- **Node.js** (v16.x or later): [Download Node.js](https://nodejs.org/en/download/)
- **MongoDB** (v5.0 or later): [Download MongoDB](https://www.mongodb.com/try/download/community)
- **npm** (v8.x or later, included with Node.js)
- **Git** (for cloning the repository): [Download Git](https://git-scm.com/downloads)
- Operating system: Windows 10/11, macOS, or Linux

## Dependent Libraries

The project uses several dependencies that will be installed automatically through npm:

```
# Backend dependencies
express          # Web framework
mongoose         # MongoDB ODM
axios            # HTTP client
bcryptjs         # Password hashing
jsonwebtoken     # Authentication

# Frontend dependencies
react            # UI library
react-dom        # DOM rendering
react-router-dom # Routing
redux            # State management
react-toastify   # Notifications
```

## Download Instructions

1. Clone the repository from GitHub:

```
git clone https://github.com/your-organization/mern-form.git
cd mern-form
```

## Build Instructions

1. Install server dependencies:

```
npm install
```

2. Install client dependencies:

```
cd client
npm install
```

3. Create a `.env` file in the project root with the following variables:

```
MONGO_URI=mongodb://localhost:27017/fault-tracking-system
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
```

## Installation of Actual Application

1. Ensure MongoDB is running:

```
mongod --dbpath /path/to/data/directory
```

2. Initialize the database (optional):

```
node server/scripts/seed.js
```

3. Required directories:

- The application will create necessary directories automatically
- Ensure write permissions for the `client/public/uploads` directory for fault images

## Run Instructions

### Development Mode

1. Start the development servers:

```
npm run dev
```

This will start both the backend server and the React development server concurrently.

### Production Mode

1. Build the client:

```
cd client
npm run build
```

2. Start the production server:

```
cd ..
npm start
```

3. Access the application at: `http://localhost:3000`

## Troubleshooting

### Common Issues and Solutions

**1. MongoDB Connection Errors**  
**Error**: `MongoNetworkError: failed to connect to server`  
**Solution**: Ensure MongoDB is running and check the connection string in `.env`.

**2. Port Already in Use**  
**Error**: `Error: listen EADDRINUSE: address already in use :::3000`  
**Solution**: Change the `PORT` in the `.env` file or terminate the process using port 3000.

**3. Missing Dependencies**  
**Error**: `Cannot find module 'xyz'`  
**Solution**: Run `npm install` in both the root and `client` directories.

**4. Image Upload Issues**  
**Error**: `Error: EACCES: permission denied, access '/uploads'`  
**Solution**: Ensure the `uploads` directory has proper write permissions.

**5. JWT Authentication Errors**  
**Error**: `JsonWebTokenError: invalid token`  
**Solution**: Check `JWT_SECRET` in `.env` and ensure it hasn't changed.

**6. React Build Errors**  
**Error**: `Failed to compile` during `npm run build`  
**Solution**: Check console for specific error messages. Try removing `node_modules` and reinstalling:

```
rm -rf node_modules
npm install
```

---

For additional support, please contact the development team or open an issue on the project's GitHub repository.

---
