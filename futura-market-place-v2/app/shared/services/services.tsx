import type {
  EventAPI,
  AuthResponse,
  CreateOrder,
  Commission,
  UserData,
  Order,
  TransferToTicket,
  ResaleTicket,
  NewUserInfo,
} from '../interface';

export async function getEvents(): Promise<EventAPI[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/events`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return await response.json();
}

export async function getEventById(id: string): Promise<EventAPI> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/events/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  return await response.json();
}

export async function getEventByUrl(url: string): Promise<EventAPI> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/events/${url}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event by URL: ${response.statusText}`);
  }

  return await response.json();
}

// export async function getEventCommission(eventId: string): Promise<Commission> {
//   return await fetch(
//     `${process.env.NEXT_PUBLIC_FUTURA_API}/events/${eventId}`,
//     {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     }
//   )
//     .then(async (response: Response) => {
//       return await response.json();
//     })
//     .catch((err) => console.log(err));
// }
export async function getEventCommission(
  eventId: string
): Promise<Commission> {
  try {
    const response = await fetch('/api/commission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener la comisión');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getEventCommission:', error);
    throw error;
  }
}


export async function loginWithGoogle(
  accessToken: string
): Promise<AuthResponse> {
  try {
    // Log para depuración
    console.log('Iniciando autenticación con token desde cliente');

    // Ahora llamamos a nuestra ruta API interna en lugar de la API externa directamente
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(
        errorData.error || 'Error en la autenticación con Google'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    throw error;
  }
}

export const registerWithCredentials = async (
  name: string,
  email: string,
  password: string,
  role = 'USER'
) => {
  try {
    const response = await fetch('/api/auth/register-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Error en el registro');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registerWithCredentials:', error);
    throw error;
  }
};

export const loginWithCredentials = async (email: string, password: string): Promise<any> => {
  try {
    const response = await fetch('/api/auth/login-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Error al iniciar sesión');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en loginWithCredentials:', error);
    throw error;
  }
};

export const registerWithGoogle = async (accessToken: string) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        isRegistration: true, // Flag para diferenciar registro de login en la API
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el registro con Google');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registerWithGoogle:', error);
    throw error;
  }
};

export const createOrderReq = async (createOrder: CreateOrder) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA}/api/events/create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createOrder }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createOrderReq:', error);
    throw error;
  }
};

export async function getStripeConfig(): Promise<{ config: string }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/stripe`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Stripe config');
  }

  return await response.json();
}

export const getOrderById = async (paymentId: string): Promise<Order[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_FUTURA}/api/orders/${paymentId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.statusText}`);
  }

  return await response.json();
};

export async function getUserProfile(): Promise<UserData> {
  return await fetch(`/api/user/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  })    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error('Error loading user data');
      }
      return await response.json();
    });
}

export async function updateUserProfile(newInfo: NewUserInfo): Promise<UserData> {
  return await fetch(`/api/user/update-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify({ newInfo }),
  })    .then(async (response: Response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating profile');
      }
      return await response.json();
    });
}

export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  return await fetch(`/api/user/update-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })    .then(async (response: Response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating password');
      }
      return;
    });
}
export async function getUserTickets(userId: string): Promise<Order[]> {
  return await fetch(
    `/api/user/tickets/${userId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error('Error loading tickets');
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Error en getUserTickets:', err);
      return [];
    });
}

export async function getResaleTickets(eventId: string): Promise<ResaleTicket[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA}/api/resales/${eventId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch resale tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getResaleTickets:', error);
    return [];
  }
}

export async function resaleSale(sale: string, resalePrice: number): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/resales/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ sale, resalePrice }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create resale');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resaleSale:', error);
    throw error;
  }
}

export async function cancelResaleSale(sale: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA}/api/resales/cancel-resale`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ sale }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel resale');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en cancelResaleSale:', error);
    throw error;
  }
}

export async function transferSale(
  sale: string,
  transferToTicket: TransferToTicket
): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ sale, transferToTicket }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transfer ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en transferSale:', error);
    throw error;
  }
}

export async function getCouponInfo(code: string): Promise<{discount: number, eventId: string}> {
  try {
    const response = await fetch(`/api/coupon/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al validar el cupón');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getCouponInfo:', error);
    throw error;
  }
}

export async function getPromoCodeInfo(code: string): Promise<{ eventId: string }> {
  try {
    const response = await fetch(`/api/promoCode/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al validar el promoCode');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getPromoCodeInfo:', error);
    throw error;
  }
}

export async function recoveryEmail(email: string): Promise<any> {
  try {
    const response = await fetch('/api/auth/send-email-to-recover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      // Intentar obtener el error como JSON, pero si no es posible, usar un mensaje genérico
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar el email de recuperación');
      } catch (jsonError) {
        // Si no puede parsear el JSON, usar un mensaje basado en el status
        throw new Error(`Error ${response.status}: Error al enviar el email de recuperación`);
      }
    }

    // Intentar obtener la respuesta como JSON, pero si no hay contenido, considerar como éxito
    try {
      return await response.json();
    } catch (jsonError) {
      // Si no hay JSON en la respuesta, pero el status es OK, considerar como éxito
      return { success: true, message: 'Email de recuperación enviado exitosamente' };
    }
  } catch (error) {
    console.error('Error en recoveryEmail:', error);
    throw error;
  }
}

export async function recoveryPassword(token: string, newPassword: string): Promise<any> {
  try {
    const response = await fetch('/api/auth/recover-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar la contraseña');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en recoveryPassword:', error);
    throw error;
  }
}

// ==================== ADMIN SERVICES ====================

export async function getAdminEvents(): Promise<EventAPI[]> {
  try {
    const response = await fetch('/api/admin/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAdminEvents:', error);
    throw error;
  }
}

export async function createAdminEvent(eventData: any): Promise<EventAPI> {
  try {
    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createAdminEvent:', error);
    throw error;
  }
}

export async function getAdminPromoters(): Promise<any[]> {
  try {
    const response = await fetch('/api/admin/promoters', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching promoters');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAdminPromoters:', error);
    throw error;
  }
}

export async function getAdminOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/api/admin/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAdminOrders:', error);
    throw error;
  }
}

export async function getPromoterEvents(promoterId: string): Promise<EventAPI[]> {
  try {
    const response = await fetch(`/api/admin/promoters/${promoterId}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching promoter events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getPromoterEvents:', error);
    throw error;
  }
}

export async function updatePromoter(promoterId: string, promoterData: any): Promise<any> {
  try {
    const response = await fetch(`/api/admin/promoters/${promoterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(promoterData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating promoter');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updatePromoter:', error);
    throw error;
  }
}

export async function deletePromoter(promoterId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/promoters/${promoterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting promoter');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deletePromoter:', error);
    throw error;
  }
}

export async function updateEvent(eventId: string, eventData: any): Promise<EventAPI> {
  try {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateEvent:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deleteEvent:', error);
    throw error;
  }
}

export async function refundOrder(orderId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error processing refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en refundOrder:', error);
    throw error;
  }
}

// ==================== REVIEWS SERVICES ====================

export async function getEventReviews(eventId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/reviews/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching reviews');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getEventReviews:', error);
    return [];
  }
}

export async function createReview(reviewData: any): Promise<any> {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createReview:', error);
    throw error;
  }
}

export async function getAdminReviews(): Promise<any[]> {
  try {
    const response = await fetch('/api/admin/reviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching reviews');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAdminReviews:', error);
    throw error;
  }
}

export async function updateReviewStatus(reviewId: string, status: string): Promise<any> {
  try {
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateReviewStatus:', error);
    throw error;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deleteReview:', error);
    throw error;
  }
}

// ==================== WISHLIST SERVICES ====================

export async function getWishlist(): Promise<EventAPI[]> {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching wishlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getWishlist:', error);
    return [];
  }
}

export async function addToWishlist(eventId: string): Promise<void> {
  try {
    const response = await fetch(`/api/wishlist/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error adding to wishlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en addToWishlist:', error);
    throw error;
  }
}

export async function removeFromWishlist(eventId: string): Promise<void> {
  try {
    const response = await fetch(`/api/wishlist/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error removing from wishlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en removeFromWishlist:', error);
    throw error;
  }
}

