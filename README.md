![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.16-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

# Macu Admin

<p align="center">

Business Operations & Analytics Platform for the Macu Express e-commerce ecosystem.

Built with React, Django REST Framework, PostgreSQL, Docker, and modern data visualization.

</p>

<p align="center">

[Live Demo](#) •
[API Documentation](#api-documentation) •
[Architecture](#architecture) •
[Installation](#installation)

</p>

---

![Dashboard Overview](docs/screenshots/dashboard-overview.png)

> **Macu Admin** is a modern administration platform designed to manage products, customers, inventory, orders, and business analytics for the Macu Express e-commerce ecosystem.

---

## Demo

**GIF**

![Macu Admin Demo](docs/demo/macu-admin-demo.gif)

or

📺 YouTube Demo (coming soon)

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
- Status updates
- Order timeline
- Internal notes
- Customer details

---

## Product Management

- Product CRUD
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
- Dark & Light themes
- English / Spanish localization
- Accessible interface
- Toast notifications
- Loading skeletons
- Tooltips
- Keyboard-friendly navigation

---

# Screenshots

## Dashboard

![Dashboard](docs/screenshots/dashboard-overview.png)

---

## Sales Analytics

![Analytics](docs/screenshots/analytics-sales.png)

---

## Product Insights

![Products](docs/screenshots/analytics-products.png)

---

## Orders

![Orders](docs/screenshots/orders-management.png)

---

## Products

![Products](docs/screenshots/products-management.png)

---

## Customers

![Customers](docs/screenshots/customers-management.png)

---

## Responsive Design

![Responsive](docs/screenshots/responsive-dashboard.png)

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
- JWT Authentication
- Cloudinary
- WhiteNoise

---

## DevOps

- Docker
- Docker Compose
- Gunicorn
- GitHub Actions

---

# Architecture

```
                React Admin (Vite)

                       │

                  REST API

                       │

      Django REST Framework + Gunicorn

                       │

                 PostgreSQL
```

---

# API Documentation

The backend provides an OpenAPI 3.0 specification generated with DRF Spectacular.

### Swagger UI

```
http://localhost:8000/en/api/docs/
```

### ReDoc

```
http://localhost:8000/en/api/docs/redoc/
```

---

# Accessibility

Accessibility was considered throughout development.

Quality checks include:

- ✅ axe DevTools
- ✅ Lighthouse
- ✅ ESLint
- ✅ Responsive testing
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus management

---

# Internationalization

Languages supported:

- 🇺🇸 English
- 🇪🇸 Spanish

---

# Running Locally

## Clone

```bash
git clone https://github.com/Ringdealer/macu-admin.git
```

---

## Environment

Create

```
.env
```

using

```
.env.example
```

---

## Docker

```bash
docker compose up --build
```

Services

| Service | URL |
|----------|-----|
| Admin Dashboard | http://localhost:5173 |
| API | http://localhost:8000 |
| ReDoc | http://localhost:8000/en/api/docs/redoc/ |

---

# Project Structure

```
backend/
frontend-admin/
Docker/
docs/
nginx/
```

---

# Quality Assurance

The project has been verified using:

- ESLint
- Production build
- Lighthouse
- axe Accessibility Testing
- Django tests

---

# Relationship with Macu Express

Macu Admin is the internal administration platform developed for the Macu Express e-commerce ecosystem.

It communicates with a shared Django REST Framework backend that powers customer-facing commerce features while providing operational tools for administrators.

---

# Future Improvements

- Advanced reporting
- Inventory forecasting
- Role-based permissions
- Audit log enhancements
- Real-time notifications

---

# License

MIT License