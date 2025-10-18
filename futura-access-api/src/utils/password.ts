import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (sentPassword: string, accountPassword): Promise<boolean> => {
  return bcrypt.compare(sentPassword, accountPassword);
};
