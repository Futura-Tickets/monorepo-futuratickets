import { toast } from 'sonner';

export const notifications = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  addedToCart: (eventName: string, quantity: number) => {
    const ticketText = quantity > 1 ? 's' : '';
    toast.success('Added to cart', {
      description: `${quantity} ticket${ticketText} for ${eventName}`,
      duration: 3000,
    });
  },

  removedFromCart: (eventName: string) => {
    toast.info('Removed from cart', {
      description: eventName,
      duration: 3000,
    });
  },

  addedToWishlist: (eventName: string) => {
    toast.success('Added to wishlist', {
      description: eventName,
      duration: 3000,
    });
  },

  removedFromWishlist: (eventName: string) => {
    toast.info('Removed from wishlist', {
      description: eventName,
      duration: 3000,
    });
  },

  orderCreated: (orderId: string) => {
    toast.success('Order created successfully', {
      description: `Order ID: ${orderId}`,
      duration: 5000,
    });
  },

  paymentSuccess: () => {
    toast.success('Payment successful', {
      description: 'Your tickets have been sent to your email',
      duration: 6000,
    });
  },

  paymentFailed: (reason?: string) => {
    toast.error('Payment failed', {
      description: reason || 'Please try again or contact support',
      duration: 6000,
    });
  },

  loginRequired: () => {
    toast.warning('Login required', {
      description: 'Please log in to continue',
      duration: 4000,
    });
  },

  networkError: () => {
    toast.error('Network error', {
      description: 'Please check your connection and try again',
      duration: 5000,
    });
  },

  sessionExpired: () => {
    toast.warning('Session expired', {
      description: 'Please log in again',
      duration: 5000,
    });
  },

  copiedToClipboard: (text?: string) => {
    toast.success('Copied to clipboard', {
      description: text,
      duration: 2000,
    });
  },

  ticketTransferred: (recipientEmail: string) => {
    toast.success('Ticket transferred', {
      description: `Sent to ${recipientEmail}`,
      duration: 5000,
    });
  },

  ticketListed: (price: number) => {
    toast.success('Ticket listed for resale', {
      description: `Price: $${price.toFixed(2)}`,
      duration: 4000,
    });
  },

  ticketCancelled: () => {
    toast.info('Resale cancelled', {
      description: 'Ticket removed from marketplace',
      duration: 3000,
    });
  },
};
