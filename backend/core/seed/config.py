SIMULATION_MONTHS = 6

CUSTOMER_COUNT = 55
PRODUCT_COUNT = 28
ORDER_COUNT = 140

PRODUCT_CATEGORIES = [
    "Rice",
    "Beans",
    "Cooking Oil",
    "Pasta",
    "Milk Powder",
    "Soap",
    "Detergent",
    "Toothpaste",
    "Canned Tuna",
    "Coffee",
]

PRODUCT_NAMES = {
    "Rice": [
        "Thai Jasmine Rice",
        "Long Grain Rice",
        "Premium White Rice",
    ],
    "Beans": [
        "Black Beans",
        "Red Kidney Beans",
        "Pinto Beans",
    ],
    "Cooking Oil": [
        "Sunflower Oil",
        "Vegetable Oil",
        "Olive Oil",
    ],
    "Pasta": [
        "Spaghetti",
        "Macaroni",
        "Penne Pasta",
    ],
    "Milk Powder": [
        "Whole Milk Powder",
        "Instant Milk Powder",
    ],
    "Soap": [
        "Bath Soap",
        "Antibacterial Soap",
    ],
    "Detergent": [
        "Laundry Detergent",
        "Liquid Detergent",
    ],
    "Toothpaste": [
        "Mint Toothpaste",
        "Whitening Toothpaste",
    ],
    "Canned Tuna": [
        "Tuna in Water",
        "Tuna in Oil",
    ],
    "Coffee": [
        "Ground Coffee",
        "Arabica Coffee",
    ],
}

CUSTOMER_COUNTRIES = [
    "Cuba",
    "Spain",
    "Mexico",
    "USA",
]

ORDER_STATUS_DISTRIBUTION = {
    "pending": 0.10,
    "confirmed": 0.15,
    "packed": 0.15,
    "shipped": 0.15,
    "in_transit": 0.20,
    "delivered": 0.20,
    "cancelled": 0.05,
}

PAYMENT_STATUS_DISTRIBUTION = {
    "paid": 0.75,
    "unpaid": 0.20,
    "failed": 0.05,
}