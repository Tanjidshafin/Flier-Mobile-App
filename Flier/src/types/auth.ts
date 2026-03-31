export type CountryOption = {
  code: string;
  dialCode: string;
  name: string;
};

export type AuthIdentifierType = 'username' | 'phoneNumber';

export type AuthUser = {
  avatar?: {
    publicId?: string | null;
    url?: string | null;
  };
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyPhonePayload = {
  otp: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
};
