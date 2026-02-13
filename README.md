# Mishwar App (Project Mishwar1)

A transportation management application for students, drivers, and parents.

## Features

- **Student Dashboard**: Request rides, see upcoming trips, scan QR codes.
- **Driver Dashboard**: View daily routes, manage student attendance.
- **Parent Dashboard**: Track children, view attendance history, make payments.
- **Authentication**: JWT-based login and registration.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components`: React components for each dashboard.
- `src/api`: API service files (`auth.js`, `parent.js`, `student.js`, `driver.js`).
- `src/App.jsx`: Main routing and layout.

## API Integration

The app connects to a backend API specified in `Mishwar API.yaml`.
Base URL: `https://7bt3gzgt-8000.uks1.devtunnels.ms/api`
