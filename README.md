# AirSafe Nasugbu: IoT-Based Environmental & Air Quality Monitoring System

AirSafe Nasugbu is a real-time Internet of Things (IoT) monitoring solution designed for the municipality of Nasugbu, Batangas. The system aggregates, analyzes, and visualizes environmental metrics to aid local government units (LGU) and local residents in identifying air quality threats, tracking micro-climatic patterns, and managing emergency safety alerts.

---

## System Overview

The application functions as a centralized command center that securely ingests high-frequency telemetry from localized hardware nodes deployed across various barangays. By translating complex sensory data into intuitive visual dashboards, interactive maps, and automated emergency notifications, AirSafe Nasugbu provides actionable insights for municipal health and environmental response.

---

## Core Features

### 1. Real-Time Telemetry & Hardware Integration
* **Secure Telemetry Ingestion**: Ingests automated reports from remote ESP32/ESP8266 microcontroller units equipped with environmental sensors.
* **Cryptographic Hardware Access**: Validates incoming HTTP payloads via device-specific API tokens to prevent unauthorized or spoofed data injections.
* **Automated Node Heartbeat**: Evaluates hardware connectivity status (`online`, `offline`) in real-time using transaction-level "Last Seen" updates.

### 2. Analytical Dashboards & Public Advisory
* **Interactive Spatiotemporal Mapping**: Pins active hardware nodes on an interactive map layer, color-coded by real-time air quality index levels.
* **Advanced Data Visualization**: Renders historic and current temperature, relative humidity, heat index, and toxic gas concentrations using dynamic charts.
* **Public Health Advisory**: Features a localized advisory board delivering safety recommendations to citizens based on environmental standards.

### 3. Early Warning & Alert Automation
* **Safety Threshold Enforcement**: Constantly monitors incoming readings for hazardous conditions.
* **Automatic Emergency Dispatch**: Automatically flags anomalies when the Air Quality Index (AQI) exceeds 100 or when the calculated Heat Index exceeds 38°C, instantly dispatching notification alerts to municipal admin channels.

### 4. Comprehensive Admin Control Panel
* **Node & Device Inventory**: Supports registering, editing, and deleting hardware monitoring points, complete with geographic coordinates (latitude and longitude).
* **Barangay Segmentation**: Maps sensors to individual barangays for localized intelligence and safety coverage.
* **Administrative Audit Trails**: Maintains searchable system logs and historical sensor logs to track environment trends.

---

## Technology Stack

* **Backend Framework**: Laravel 12 (PHP 8.2+)
* **Frontend Library**: React 18, Vite 7, Inertia.js 2
* **Styling & Icons**: Tailwind CSS 3, Headless UI, Lucide React
* **Data Visualization**: Recharts (for charts/trends), Leaflet & React-Leaflet (for geographic mapping)
* **Database & ORM**: MySQL / MariaDB using Eloquent ORM
* **Communication Protocols**: JSON over HTTPS APIs (RESTful endpoints)

---

## Key Architecture Modules

* **API Ingestion Controller**: `app/Http/Controllers/Api/TelemetryController.php` — Handles authorization, telemetry validation, heartbeat updates, and triggers warnings.
* **Hardware Registration Model**: `app/Models/Device.php` — Defines node properties, location metadata, and coordinates.
* **Telemetry Data Model**: `app/Models/SensorReading.php` — Manages environmental logs.
* **Emergency Mail Dispatch**: `app/Mail/EmergencyAlert.php` — Constructs and formats notifications for local administrators.
* **Public Interface View**: `resources/js/Pages/Public/Advisory.jsx` — Public-facing page rendering air status and advice.
* **Geographic Map Component**: `resources/js/Pages/Admin/Map.jsx` — Provides visual tracking of hardware coordinates on an interactive map layer.
