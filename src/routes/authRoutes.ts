import { User } from "../entities/User";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/JWTUtils";
interface UserVerify {
  email: string;
  password: string;
}

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData: UserVerify = { email, password };
    if (!userData.email) throw new Error();
    const {
      id,
      name,
      phone,
      password: passwordHashed,
      createdAt,
    } = (await User.getRepository().findOneBy({
      email: userData.email,
    })) || {};
    if (!userData.password) throw new Error("Password is required");
    if (!(await bcrypt.compareSync(userData.password, passwordHashed || "")))
      return res.status(403).json({
        logued: false,
        error: {
          message: "Invalid credentials",
        },
      });
    const dataUserFinal = { id, email, name, phone, passwordHashed, createdAt };
    const token = generateToken(dataUserFinal, { expiresIn: "1d" });
    console.log(token);
    return res.json({
      logued: true,
      user: dataUserFinal,
      token,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error)
      return res.status(500).json({
        logued: false,
        error: { message: error.message },
      });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { email, name, password, phone } = await req.body;
    const userData = { email, name, password, phone };
    const existNumberPhone =
      (await User.findBy({ phone: userData.phone })).length > 0;
    if (existNumberPhone)
      return res.status(400).json({
        registered: false,
        exists: existNumberPhone,
        error: {
          message: "Telefono ya registrado. Intentelo de nuevo.",
        },
      });
    const isSavedUserActual =
      (await User.findBy({ email: userData.email })).length > 0;
    if (isSavedUserActual)
      return res.status(400).json({
        registered: false,
        exists: isSavedUserActual,
        error: {
          message: "Email ya registrado. Intentelo de nuevo.",
        },
      });
    if (!process.env.SALT_ENCRYPT_PASSWORDS) throw new Error();
    const salt = bcrypt.genSaltSync(
      parseInt(process.env.SALT_ENCRYPT_PASSWORDS)
    );
    const passwordHashed = bcrypt.hashSync(password, salt);
    const userNew = new User();
    userNew.name = name;
    userNew.email = email;
    userNew.password = passwordHashed;
    userNew.phone = phone;
    await userNew.save();
    return res.json({
      registered: true,
      user: userData,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      registered: false,
      error,
    });
  }
});

export default router;
