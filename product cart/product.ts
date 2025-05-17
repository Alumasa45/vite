export interface Product {
    name: string;
    category: string;
    price: number;
    image: {
        thumbnail: string;
        mobile: string;
        tablet: string;
        desktop: string;
    };
    };

    export interface CartItem {
        name: string;
        price: number;
        image: string;
        quantity: number;
    }

export type NotificationType = 'success' | 'error';