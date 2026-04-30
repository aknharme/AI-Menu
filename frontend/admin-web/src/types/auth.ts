// AuthUser, JWT ile donen oturum bilgisinin frontend tarafindaki temsilidir.
export type AuthUser = {
  userId: string;
  restaurantId: string;
  fullName: string;
  email: string;
  role: string;
};

// AuthResponse, login ve register sonrasinda token ile kullanici bilgisini birlikte tasir.
export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  user: AuthUser;
};

// LoginRequest, admin ve cashier ortak auth endpoint'ine giden sade form modelidir.
export type LoginRequest = {
  email: string;
  password: string;
};
