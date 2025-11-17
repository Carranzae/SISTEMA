export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidRUC = (ruc: string): boolean => {
  return ruc.length === 11 && /^\d{11}$/.test(ruc);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\d{9}$/.test(phone.replace(/\D/g, ''));
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateBusinessData = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.nombre_comercial?.trim()) {
    errors.nombre_comercial = 'El nombre es requerido';
  }

  if (data.ruc && !isValidRUC(data.ruc)) {
    errors.ruc = 'RUC inválido';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
