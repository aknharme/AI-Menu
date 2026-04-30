// AuthUser, cashier panelinin login sonrasinda sakladigi kullanici bilgisidir.
export type AuthUser = {
  userId: string;
  restaurantId: string;
  fullName: string;
  email: string;
  role: string;
};

// AuthResponse, auth endpoint'inden donen token ve kullanici verisini birlestirir.
export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  user: AuthUser;
};

// LoginRequest, cashier ve admin rollerinin ortak giris formunda kullanilir.
export type LoginRequest = {
  email: string;
  password: string;
};
