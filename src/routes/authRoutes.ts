import { User } from "entities/User";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "@utils/JWTUtils";
interface UserVerify {
  email: string;
  password: string;
}

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = await req.body;
    const userData: UserVerify = { email, password };
    if (!userData.email) throw new Error();
    const data = await User.findOneBy({ email: userData.email });
    if (!userData.password) throw new Error("Password is required");
    if (!(await bcrypt.compareSync(userData.password, data?.password || "")))
      return res.status(403).json({
        logued: false,
        error: {
          message: "Invalid credentials",
        },
      });
    const token = generateToken(userData, { expiresIn: "1d" });
    return res.json({
      logued: true,
      user: data,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      logued: false,
      error,
    });
  }
});

export default router;
