import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  sentPassword: string,
  accountPassword,
): Promise<boolean> => {
  return bcrypt.compare(sentPassword, accountPassword);
};

export const generateRandomPassword = (passwordLength: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < passwordLength) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
