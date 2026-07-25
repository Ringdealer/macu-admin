# Macu

Macu is a full-stack web application that manages product imports, customer orders, and delivery notifications for a company that imports goods from Spain and delivers them directly to customers in Cuba.

---

## Features

### Public Application
- User registration and authentication
- Google social authentication
- Product catalog and featured products
- Product detail pages
- Shopping cart system
- Checkout and order creation
- Order tracking
- User profile management
- Responsive mobile-friendly interface

### Business Logic
- Customer management
- Stock alert system
- Notification system
- WhatsApp notification logic for:
  - Automatic new order alerts for administrators
  - Manual customer order status updates from the admin dashboard
  - Order confirmation, shipping, and delivery notifications
- Email infrastructure configured with Brevo (AnyMail), currently disabled in application logic

> WhatsApp notification logic is implemented for both administrators and customers. Automatic administrator alerts are active, while customer notifications are currently triggered manually from the admin dashboard and can be fully automated with a production WhatsApp Business API provider.

> Email infrastructure is configured using Brevo (AnyMail) and is currently disabled in application logic to avoid requiring user email addresses during signup.

---

## Tech Stack

### Frontend
- React
- React Router
- Fetch-based API layer
- CSS

### Backend
- Django
- Django REST Framework
- Token Authentication
- Nested Routers

### Integrations & Services
- Cloudinary
- Brevo Email Service
- WhatsApp notification logic

---

## Screenshots

## Desktop Views

### Home Page
![Home Page](docs/screenshots/desktop-home.jpg)

### Featured Products
![Featured Products](docs/screenshots/desktop-feature-products.jpg)

### Login
![Login](docs/screenshots/desktop-login.jpg)

### Products
![Products](docs/screenshots/desktop-products.jpg)

### Product Detail
![Product Detail](docs/screenshots/desktop-product-detail.jpg)

### Shopping Cart
![Shopping Cart](docs/screenshots/desktop-cart.jpg)

### Checkout
![Checkout](docs/screenshots/desktop-checkout.jpg)

### Orders
![Orders](docs/screenshots/desktop-orders.jpg)

### Order Detail
![Order Detail](docs/screenshots/desktop-orders-detail.jpg)

### Profile
![Profile](docs/screenshots/desktop-profile.jpg)

---

## Mobile Views

### Mobile Home
![Mobile Home](docs/screenshots/mobile-home.jpg)

### Mobile Products
![Mobile Products](docs/screenshots/mobile-products.jpg)

### Mobile Navigation
![Mobile Navigation](docs/screenshots/mobile-hamburger.jpg)

---

## Project Structure

```bash
backend/
├── accounts/
├── products/
├── orders/
├── customers/
├── notifications/
├── administration/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── layouts/
│   └── routes/
```

---

## Installation

### Backend Setup

```bash
# From the project root
# Activate the virtual environment (Windows PowerShell)
.\venv.ps1

# Navigate to the backend directory
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root for backend configuration.

Example:

```env
# Django
SECRET_KEY=your_secret_key
DEBUG=True
DJANGO_ENV=local

# Database (optional in development; SQLite is used if omitted)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Allowed hosts (required in production)
ALLOWED_HOSTS=localhost,127.0.0.1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# WhatsApp (CallMeBot)
CALLMEBOT_PHONE=your_phone_number
CALLMEBOT_APIKEY=your_api_key

# Email infrastructure (optional; currently disabled in application logic)
BREVO_API_KEY=your_brevo_api_key
DEFAULT_FROM_EMAIL=noreply@example.com

# Social Login (optional; currently disabled in application logic)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
```

> This is a sample configuration. Replace the placeholder values with your own credentials.
>
> Only a subset of variables is required for local development. For example, if you are not using Cloudinary, CallMeBot, Brevo, or Google OAuth during development, those values can be omitted.

---

## API

The project uses a REST API architecture with Django REST Framework.

Example endpoints:

```bash
/api/v1/products/
/api/v1/orders/
/api/v1/customers/
/api/v1/accounts/
```

---

## Main Functionalities

- Product management
- Cart and checkout workflow
- Customer order tracking
- Authentication and authorization
- Notification workflows
- Responsive UI for desktop and mobile devices

---

## Demo Video

Demo video coming soon.

<!-- Replace with your YouTube link -->
<!-- https://youtube.com/your-demo-link -->

---

## Real-World Context

Macu was inspired by a real importing business workflow involving:
- Product sourcing from Spain
- Customer order management
- Delivery coordination in Cuba
- Customer communication and notifications

---

## Future Improvements

- Online payments
- Real-time notifications
- Full WhatsApp Business API integration
- Advanced analytics dashboard
- Inventory management improvements
- Multi-language support

---

## Author

Developed by Ringdealer.

- GitHub: https://github.com/ringdealer
- LinkedIn: https://linkedin.com/in/ringdealer

---

## License

Macu is a full-stack portfolio project designed to demonstrate real-world architecture for an import and delivery platform, including authentication, order management, notifications, and external service integrations.

This project is not licensed for commercial use.