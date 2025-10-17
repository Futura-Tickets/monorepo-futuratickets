'use client';
import {
  Account,
  CreateAccess,
  CreateAccount,
  CreateEvent,
  DateTime,
  Event,
  EventStatus,
  LoginAccount,
  Order,
  PromoterClient,
  Sale,
  TokenCheck,
  Coupon,
  CreateInvitation,
  PromoCode,
  ApiSettings,
  EditEvent,
  PaymentMethod,
  Notification,
  RequestedPayment,
} from './interfaces';

export async function createAccount(
  createAccount: CreateAccount
): Promise<any> {
  return await fetch(`/api/accounts`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ createAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

export async function createPromoterAccount(
  createPromoterAccount: CreateAccount
): Promise<Account> {
  return await fetch(`/api/accounts/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ createPromoterAccount }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

export async function createAccessAccount(
  createAccessAccount: CreateAccess
): Promise<Account> {
  return await fetch(
    `/api/accounts/create-access`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ createAccessAccount }),
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

// EVENTS
export async function getEvents(): Promise<any> {
  return await fetch(`/api/events`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching events:', err);
      return [];
    });
}

export async function createEvent(createEvent: CreateEvent): Promise<Event> {
  return await fetch(`/api/events`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ createEvent }),
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => console.log(err));
}

export async function editEvent(event: string, editEvent: EditEvent): Promise<Event> {
  return await fetch(`/api/events/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ editEvent }),
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => console.log(err));
}

export async function launchEvent(event: string, dateTime: DateTime): Promise<Event> {
  return await fetch(`/api/launch/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({
      event,
      updateEvent: { status: EventStatus.LAUNCHED, dateTime },
    }),
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => console.log(err));
}

export async function getOrders(): Promise<any> {
  return await fetch(`/api/events`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching orders:', err);
    return [];
  });
}

export async function getAnalytics(): Promise<any> {
  return await fetch(`/api/events`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching analytics:', err);
    return {};
  });
}

export async function getCampaigns(): Promise<any> {
  return await fetch(`/api/campaigns`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching campaigns:', err);
      return [];
    });
}

export async function getPayments(): Promise<any> {
  return await fetch(`/api/payments`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching payments:', err);
      return [];
    });
}

export async function getEventAccessAccounts(
  event: string
): Promise<Account[]> {
  return await fetch(
    `/api/access/accounts/${event}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching event access accounts:', err);
    return [];
  });
}

export async function getEventAccess(event: string): Promise<Event> {
  return await fetch(`/api/access/${event}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching event access:', err);
    throw err;
  });
}

export async function getEventResale(event: string): Promise<Event> {
  return await fetch(`/api/resale/${event}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching event resale:', err);
    throw err;
  });
}

export async function enableResale(
  event: string,
  status: boolean
): Promise<void> {
  return await fetch(`/api/resale/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ status }),
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => console.log(err));
}

export async function getEvent(event: string): Promise<Event> {
  return await fetch(`/api/events/${event}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching event:', err);
    throw err;
  });
}

export async function deleteEvent(event: string): Promise<any> {
  return await fetch(`/api/events/${event}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting event:', err);
      throw err;
    });
}

export async function updateAccount(account: any): Promise<any> {
  return await fetch(`/api/accounts/create`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(account),
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error updating account:', err);
    throw err;
  });
}

export async function getClients(): Promise<PromoterClient[]> {
  return await fetch(`/api/clients`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(async (response: Response) => {
    return await response.json();
  })
  .catch((err) => {
    console.error('Error fetching clients:', err);
    return [];
  });
}

export async function getClient(client: string): Promise<PromoterClient> {
  return await fetch(
    `/api/clients/${client}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching client:', err);
      throw err;
    });
}

export async function deleteAdminAccount(adminAccount: string): Promise<any> {
  return await fetch(
    `/api/accounts/admin/${adminAccount}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting admin account:', err);
      throw err;
    });
}

export async function checkExpiration(): Promise<TokenCheck> {
  return await fetch(
    `/api/accounts/validate`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token') }),
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error checking token expiration:', err);
      throw err;
    });
}

export async function loginAccount(
  loginAccount: LoginAccount
): Promise<Account> {
  return await fetch(`/api/accounts/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginAccount),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Login error:', err);
      throw err;
    });
}

export async function loginGoogle(codeResponse: string): Promise<Account> {
  return await fetch(
    `/api/accounts/login-google`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ googleCode: codeResponse }),
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

export async function getAdminAccounts(): Promise<any> {
  return await fetch(`/api/accounts/admin`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching admin accounts:', err);
      return [];
    });
}

export async function getOrder(order: string): Promise<Order> {
  return await fetch(`/api/orders/${order}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching order:', err);
      throw err;
    });
}

export async function getSale(sale: string): Promise<Sale> {
  return await fetch(`/api/sales/${sale}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching sale:', err);
      throw err;
    });
}

export async function getSales(): Promise<Sale[]> {
  return await fetch(`/api/sales`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching sales:', err);
      return [];
    });
}

export async function getProfile(): Promise<Account> {
  return await fetch(`/api/accounts`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching profile:', err);
      throw err;
    });
}

export async function getEventInvitations(event: string): Promise<Sale[]> {
  return await fetch(
    `/api/invitations/${event}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching event invitations:', err);
      return [];
    });
}

// COUPONS FUNCTIONS

export async function createCoupon(
  eventId: string,
  couponData: any
): Promise<Coupon> {
  return await fetch(`/api/coupons/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ eventId, ...couponData }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating coupon:', err);
      throw err;
    });
}

export const getCoupons = async (eventId: string): Promise<Coupon[]> => {
  return await fetch(`/api/coupons/${eventId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching coupons:', err);
      return [];
    });
};

export async function deleteCoupon(eventId: string, couponCode: string): Promise<any> {
  return await fetch(`/api/coupons/${eventId}/${couponCode}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error deleting coupon:', err);
    throw err;
  });
}

// INVITATIONS FUNCTIONS

export const getInvitations = async (eventId: string): Promise<Sale[]> => {
  return await fetch(`/api/invitations/${eventId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error fetching invitations:', err);
    return [];
  });
};

export async function createInvitation(createInvitation: CreateInvitation): Promise<Order> {
  return await fetch(`/api/invitations/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(createInvitation),
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error creating invitation:', err);
    throw err;
  });
}

export async function deleteInvitation(eventId: string, invitationId: string): Promise<any> {
  return await fetch(
    `/api/invitations/${eventId}/${invitationId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting invitation:', err);
      throw err;
    });
}

export async function enableDisableApi(apiEnabled: boolean): Promise<ApiSettings> {
  return await fetch(`/api/promoter`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ apiEnabled }),
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => console.log(err));
}

export const getFuturaApiSettings = async (): Promise<ApiSettings> => {
  return await fetch(`/api/promoter`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error fetching API settings:', err);
    throw err;
  });
};

//NOTIFICATIONS FUNCTIONS
export const getNotifications = async (): Promise<Notification[]> => {
  return await fetch(`/api/notifications`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error fetching notifications:', err);
    return [];
  });
};

export const getNotificationsByOrderId = async (orderId: string): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error fetching notifications by order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications by order:', error);
    throw error;
  }
};

export const getNotificationsByClientId = async (clientId: string): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/client/${clientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error fetching notifications by client');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications by client:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string, promoterId: string): Promise<Notification> => {
  return await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ promoterId }),
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error marking notification as read:', err);
    throw err;
  });
};

export const markAllAsRead = async (promoterId: string): Promise<{ success: boolean }> => {
  return await fetch(`/api/notifications/read`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ promoterId }),
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error marking all notifications as read:', err);
    return { success: false };
  });
};

export const getNotificationByOrderId = async (orderId: string): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/order/${orderId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching notification for order ${orderId}: ${response.statusText}`);
    }

    const notification: Notification = await response.json();
    return notification;
  } catch (error) {
    console.error(`Error fetching notification by order ID: ${error}`);
    throw error;
  }
};

// PROMOCODES FUNCTIONS

export const getPromoCodes = async (eventId: string): Promise<PromoCode[]> => {
  return await fetch(`/api/promocodes/${eventId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error fetching promo codes:', err);
    return [];
  });
};

export async function createPromoCode(
  eventId: string,
  promoCodeData: any
): Promise<PromoCode> {
  return await fetch(`/api/promocodes/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ eventId, ...promoCodeData }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating promo code:', err);
      throw err;
    });
}

export async function deletePromoCode(
  eventId: string,
  promoCodeId: string
): Promise<any> {
  return await fetch(`/api/promocodes/${eventId}/${promoCodeId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async (response: Response) => {
    return await response.json();
  }).catch((err) => {
    console.error('Error deleting promo code:', err);
    throw err;
  });
}

// PAYMENT METHODS FUNCTIONS

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return await fetch('/api/payments/methods', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching payment methods:', err);
      return [];
    });
};

export const createPaymentMethod = async (paymentMethodData: any): Promise<PaymentMethod> => {
  return await fetch('/api/payments/methods', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(paymentMethodData),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating payment method:', err);
      throw err;
    });
};

export const deletePaymentMethod = async (id: string): Promise<any> => {
  return await fetch(`/api/payments/methods/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting payment method:', err);
      throw err;
    });
};

// PAYMENT REQUESTS FUNCTIONS

export const getPaymentRequests = async (): Promise<RequestedPayment[]> => {
  return await fetch('/api/payments/requests', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching payment requests:', err);
      return [];
    });
};

export const createPaymentRequest = async (requestData: any): Promise<RequestedPayment> => {
  return await fetch('/api/payments/requests', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(requestData),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating payment request:', err);
      throw err;
    });
};

export const deletePaymentRequest = async (requestId: string): Promise<any> => {
  return await fetch(`/api/payments/requests/${requestId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting payment request:', err);
      throw err;
    });
};


export const resendEmailOrder = async (orderId: string): Promise<boolean> => {
  return await fetch(`/api/orders/resend`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ orderId }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error resending order email:', err);
      return false;
    });
};

export const exportEventCSVRequest = async (eventId: string): Promise<void> => {
  try {
    return await fetch(`/api/export/event/${eventId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error exporting event CSV:', err);
      throw err;
    });
  } catch (error) {
    console.error('Error in exportEventCSVRequest:', error);
  }
};

export const exportClientsCSVRequest = async (): Promise<void> => {
  try {
    return await fetch(`/api/export/clients`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error exporting clients CSV:', err);
      throw err;
    });
  } catch (error) {
    console.error('Error in exportClientsCSVRequest:', error);
  }
};