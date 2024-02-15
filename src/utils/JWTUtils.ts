import jwt from "jsonwebtoken";
export const generateToken = (data: object, options: jwt.SignOptions) => {
  const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET_KEY || ""; // Change this to your actual secret key
  const token = jwt.sign(data, secretKey, options);
  return token;
};

export const validateToken = (token: string) => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET_KEY || ""; // Change this to your actual secret key
    const decoded = jwt.verify(token, secretKey) as object;
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};
