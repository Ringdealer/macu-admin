
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.16-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Accessibility](https://img.shields.io/badge/Accessibility-Tested-success)
![Code Quality](https://img.shields.io/badge/Code%20Quality-Ruff-blue)
![License](https://img.shields.io/badge/License-Portfolio--Only-yellow)

# Macu Admin

<p align="center">

A full-stack administration platform providing operational control, analytics, and business intelligence tools for the Macu Express e-commerce ecosystem.

Built with React, Django REST Framework, PostgreSQL, Docker, and modern data visualization technologies.

</p>

<p align="center">

Dashboard • Analytics • Product Management • Order Operations • Customer Management

</p>

---

<p align="center">
<img src="docs/screenshots/dashboard-overview.jpg" width="1000" alt="Macu Admin Dashboard overview">
</p>

> **Macu Admin** is an internal business operations platform designed to manage products, customers, inventory, orders, and analytics for the Macu Express e-commerce ecosystem.

The platform provides administrators with operational tools while maintaining separation between customer-facing commerce workflows and internal business operations.

---

# Table of Contents

- [Highlights](#highlights)
- [Demo](#quick-preview)
- [Full Video](#full-video)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Quality Assurance](#quality-assurance)
- [Internationalization](#internationalization)
- [Relationship with Macu Express](#relationship-with-macu-express)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

# Highlights

- Full-stack React + Django administration platform
- REST API architecture documented with OpenAPI
- Interactive business intelligence dashboard
- Responsive interface optimized for desktop and mobile workflows
- English / Spanish localization
- Accessibility-focused development
- Code quality validation with Ruff and ESLint
- Docker-based development environment

---

# Quick Preview

<p align="center">
<img src="docs/demo/macu-admin-demo.gif" width="900" alt="Macu Admin demonstration">
</p>


---

## Full Video

[Watch Demo Video](https://youtu.be/3LP4ZCueYFk)

<!-- Replace with your YouTube link -->
<!-- https://youtube.com/your-demo-link -->


---

# Features

## Dashboard & Analytics

- Interactive KPI dashboard
- Revenue and sales trends
- Product performance analysis
- Category sales visualization
- Order status analytics
- Top-selling products
- Business insights

---

## Order Management

- Order administration
- Advanced filtering
- Status workflow management
- Order timeline
- Internal notes
- Customer details
- Order history overview

---

## Product Management

- Product CRUD operations
- Inventory monitoring
- Category organization
- Stock management

---

## Customer Management

- Customer directory
- Customer profiles
- Purchase history
- Activity overview

---

## User Experience

- Responsive layout
- Dark and light themes
- English / Spanish localization
- Accessible interface
- Toast notifications
- Loading skeletons
- Tooltips
- Keyboard-friendly navigation

---

# Screenshots

## Sales Analytics

<p>
<img src="docs/screenshots/analytics-sales.jpg" width="900" alt="Sales analytics dashboard">
</p>

---

## Business Analytics

<p>
<img src="docs/screenshots/analytics-category.jpg" width="900" alt="Business analytics dashboard">
</p>

---

## Product Insights

<p>
<img src="docs/screenshots/analytics-products.jpg" width="900" alt="Product analytics dashboard">
</p>

---

## Orders

<p>
<img src="docs/screenshots/orders-management.jpg" width="900" alt="Order management interface">
</p>

---

## Products

<p>
<img src="docs/screenshots/products-management.jpg" width="900" alt="Product management interface">
</p>

---

## Customers

<p>
<img src="docs/screenshots/customers-management.jpg" width="900" alt="Customer management interface">
</p>

---

## Responsive Design

<p align="center">
<img src="docs/screenshots/responsive-dashboard.jpg" width="300" alt="Responsive dashboard layout">
</p>

---

# Architecture

```text
                    React Admin
                 Vite + Tailwind CSS
                       |
                       |
                    REST API
                       |
                       |
          Django REST Framework Backend
              DRF Spectacular + Gunicorn
                       |
                       |
                  PostgreSQL 15
```

The frontend communicates with Django through REST endpoints documented using OpenAPI.

---

# Technology Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Headless UI
- Recharts
- i18next
- React Hot Toast
- Lucide React
- jsPDF
- html2canvas

---

## Backend

- Django 5
- Django REST Framework
- DRF Spectacular
- PostgreSQL
- Django AllAuth
- dj-rest-auth
- Token Authentication
- Cloudinary
- WhiteNoise

---

## DevOps

- Docker
- Docker Compose
- Gunicorn
- Nginx
- GitHub Actions

---

# Project Structure

```text
macu-admin

├── backend
│   ├── accounts
│   ├── api
│   ├── communications
│   ├── config
│   ├── core
│   ├── fixtures
│   ├── orders
│   ├── products
│   ├── static
│   ├── templates
│   └── users
│
├── frontend-admin
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       ├── config
│       ├── context
│       ├── locales
│       ├── pages
│       ├── services
│       └── utils
│
├── Docker
├── docs
├── nginx
├── docker-compose.yml
└── README.md
```

---

# API Documentation

The backend exposes a REST API documented using OpenAPI 3.0 and Django REST Framework Spectacular.

Available during local development:

## Swagger UI

```
http://localhost:8000/api/docs/
```

## OpenAPI Schema

```
http://localhost:8000/api/schema/
```

---

# Running Locally

## Requirements

- Docker
- Docker Compose

---

## Clone Repository

```bash
git clone https://github.com/Ringdealer/macu-admin.git
```

---

## Environment Setup

Create a `.env` file using `.env.example` as a template.

---

## Start Application

```bash
docker compose up --build
```

Services:

| Service | URL |
|---|---|
| Admin Dashboard | http://localhost:5173 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/api/docs/ |

---

# Environment Variables

Example:

```env
# Django
SECRET_KEY=your_secret_key
DEBUG=True
DJANGO_ENV=local

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Hosts
ALLOWED_HOSTS=localhost,127.0.0.1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# WhatsApp Integration
CALLMEBOT_PHONE=your_phone_number
CALLMEBOT_APIKEY=your_api_key

# Email
BREVO_API_KEY=your_brevo_api_key
DEFAULT_FROM_EMAIL=noreply@example.com
```

---

# Quality Assurance

The project has been validated using:

- ✅ Django automated tests
- ✅ Ruff static analysis
- ✅ ESLint
- ✅ Production build verification
- ✅ Lighthouse audit
- ✅ axe DevTools accessibility testing

Accessibility practices include:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Responsive layouts

---

# Internationalization

Supported languages:

- 🇺🇸 English
- 🇪🇸 Spanish

---

# Relationship with Macu Express

Macu Admin is the internal operations platform developed alongside Macu Express.

It provides administrators with tools for:

- Product management
- Customer administration
- Order operations
- Business analytics

The application shares backend services with the broader Macu Express ecosystem while maintaining separation between customer-facing and internal workflows.

---

# Future Improvements

- Advanced reporting
- Inventory forecasting
- Role-based permissions
- Audit log enhancements
- Real-time notifications

---

# Author

Developed by **Ringdealer**

- GitHub: https://github.com/ringdealer
- LinkedIn: https://linkedin.com/in/ringdealer

---


# License

This project is released under a custom portfolio license.

The source code is available for educational purposes, technical review, and
portfolio evaluation.

Commercial use, redistribution, resale, or derivative commercial products
require explicit permission from the author.