# Mishwar Backend API Documentation

This document describes the API endpoints and data structures for the Mishwar backend.

## 📦 Standard Response Format

All API responses follow a standard JSON structure.

### Success Response

HTTP Status: `200 OK`, `201 Created`

```json
{
  "status": "success",
  "data": {
    // Response data here (object or array)
  },
  "message": "Optional success message"
}
```

### Error Response

HTTP Status: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

```json
{
  "status": "error",
  "data": null,
  "message": "Human readable error message",
  "errors": {
    // Optional: Field-specific validation errors
    "username": ["This field is required."]
  }
}
```

---

## 🔐 Authentication

**Base URL:** `/api/`

- **JWT Authentication:** Send header `Authorization: Bearer <access_token>`.

### Login

`POST /api/login/`

**Payload:**

```json
{
  "username": "student1",
  "password": "password123"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "refresh": "...",
    "access": "...",
    "user": {
      "id": 1,
      "username": "student1",
      "role": "PASSENGER",
      "email": "student1@example.com"
    }
  },
  "message": "Login successful"
}
```

### Refresh Token

`POST /api/token/refresh/`

**Payload:**

```json
{
  "refresh": "..."
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "access": "..."
  },
  "message": null
}
```

---

## 👥 Users

### Register User

`POST /api/users/`

Public endpoint to register a new user.

**Payload:**

```json
{
  "username": "student1",
  "password": "password123",
  "role": "PASSENGER", // "PASSENGER", "DRIVER", "PARENT"
  "phone_number": "+9647701234567"
}
```

### User Detail (Me)

`GET /api/users/me/`
`PATCH /api/users/me/`

Retrieve or update the currently logged-in user's details.

### Link Passenger (Parent Only)

`POST /api/users/link_passenger/`

Parents can link an existing passenger account to their account using the passenger's `unique_id`.

**Payload:**

```json
{
  "unique_id": "A1B2C3" 
}
```

### List Users

`GET /api/users/`

- **Admin**: Lists all users.
- **Parent**: Lists self and linked children.
- **Others**: Lists only self.

---

## 🚗 Drivers

### List Drivers

`GET /api/drivers/`

**Query Parameters:**

- `destination`: Filter by destination name (e.g., `?destination=Baghdad University`).

**Visibility & Filtering:**

- **Passenger**: Lists only `APPROVED` drivers.
- **Driver**: Lists only self.
- **Admin**: Lists all.

### Register Driver Profile

`POST /api/drivers/`

Registers a profile for the current user (must have `DRIVER` role).

**Payload:**

```json
{
  "vehicle_model": "Toyota Camry",
  "license_plate": "Baghdad 123456",
  "license_number": "D12345",
  "id_picture": "(multipart/form-data file upload)", 
  "profile_picture": "(multipart/form-data file upload)",
  "destination": "Baghdad University", // Name of destination
  "zone": 1, // ID of Residential Zone
  "capacity": 4,
  "available_weekdays": [0, 1, 2, 3, 4], // 0=Monday, 6=Sunday
  "minimum_passengers": 3 // Optional, default is 3
}
```

**Note:**

- `id_picture` is **write-only** (used for verification).
- `profile_picture` is public.
- When creating a profile, the `status` will be `PENDING` by default.

---

## 📍 Destinations

### List Destinations

`GET /api/destinations/`

Publicly readable.

**Response Data:**

```json
[
  {
    "id": 1,
    "name": "Baghdad University",
    "arrival_time": "08:30:00",
    "latitude": 33.2700,
    "longitude": 44.3750
  }
]
```

---

## 📅 Subscriptions

### Create Subscription

`POST /api/subscriptions/`

Subscribes the current user (Passenger) to a driver. Automatically generates scheduled rides for the next 30 days.

**Payload:**

```json
{
  "driver_id": 1,
  "weekdays": [0, 1, 2, 3, 4], // Days to commute (0=Monday)
  "pickup_latitude": 33.3152,
  "pickup_longitude": 44.3661
}
```

**Business Logic & Validation:**
- **Driver Status**: Driver must be `APPROVED`.
- **Capacity**: Driver must have available seats for all requested weekdays.
- **Zone**: Passenger and Driver should align on zone (currently derived from Driver's zone).
- **Distance Limit**: Maximum 30km from pickup to destination.
- **Minimum Passengers**: Warning logged if driver is below threshold.

**Pricing Formula:**
- Base Fee: 20,000 IQD
- Distance Fee: 10,000 IQD per KM
- **Formula**: `Price = 20,000 + (Distance_KM * 10,000)`
- *Note: Distance is calculated using Haversine formula.*

### List Subscriptions

`GET /api/subscriptions/`

Lists subscriptions.
- **Admin**: All subscriptions.
- **Parent**: Subscriptions of linked children.
- **Passenger**: Own subscriptions.

### Pay Subscription

`POST /api/subscriptions/{id}/pay/`

Mock payment endpoint. Updates status to `PAID`.

**Response:**

```json
{
  "status": "success",
  "message": "Payment successful."
}
```

---

## 🚕 Scheduled Rides

### List Rides

`GET /api/rides/`

Lists upcoming rides. Return trips (Destination -> Pickup) are included if `is_round_trip` is true.

**Response Data Item:**

```json
{
  "id": 101,
  "status": "SCHEDULED", // SCHEDULED, COMPLETED, CANCELLED, REASSIGNED, MISSED
  "date": "2023-10-27",
  "pickup_time": "07:45:00",
  "rider_details": { ... },
  "driver_details": { ... },
  "destination_details": { ... }
}
```

### Cancel Ride

`POST /api/rides/{id}/cancel/`

**Behavior:**

- **Passenger/Parent**:
  - Marks ride as `CANCELLED`.
- **Driver**:
  - System attempts to **automatically reassign** to another available driver.
  - **Reassignment Logic**:
    - Finds `APPROVED` drivers with same/nearby destination (within 500m).
    - Checks availability on that weekday.
    - Checks remaining capacity for that specific date.
  - If match found: Status becomes `REASSIGNED`, new driver is linked.
  - If no match: Status becomes `CANCELLED`.

**Response (Reassigned):**

```json
{
  "status": "success",
  "data": {
    "status": "Ride reassigned",
    "new_driver": "Driver Profile for driver2"
  },
  "message": null
}
```

### Complete Ride (Driver)

`PATCH /api/rides/{id}/`

**Payload:**

```json
{
  "status": "COMPLETED"
}
```
