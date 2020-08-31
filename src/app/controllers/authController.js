const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const User = require("../models/User");
const { networkInterfaces } = require("os");
const e = require("express");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

//ROTA Registrar Usuário POST
router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    //verifica se o e-mail já existe
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    //cria um novo registro
    const user = await User.create(req.body);

    //esconder a senha no retorno
    user.password = undefined;

    //gerar token do usuario
    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

//ROTA Autenticação
router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  //verifica se existe o usuario pelo email
  const user = await User.findOne({ email }).select("+password");

  //caso não encontre
  if (!user) return res.status(400).send({ error: "User not found" });

  // verifica se a senha está correta
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid Password" });

  //esconder a senha no retorno
  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id }),
  });
});

//ROTA Esqueceu a senha
router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();

    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    
    // envia email
    mailer.sendMail(
      {
        to: email,
        from: "thiagobmd@hotmail.com",
        template: "auth/forgot-password",
        context: { token },
      },
      (err) => {
        if (err)
          return res
            .status(400)
            .send({ error: "Cannot send forgot password email" });

        return res.send();
      }
    );
  } catch (err) {
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

//ROTA Resetar a senha
router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
      //seleciono o usuário e os campos do token e horario de expiração
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) return res.status(400).send({ error: "User not found" });

    //verifica se o token enviado no email é igual o que está no banco de dados
    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Token invalid" });

    const now = new Date();

    //verifica se o horário está fora acima do horário permitido, ou seja 1 hora
    if (now > user.passwordResetExpires)
      return res
        .status(400)
        .send({ error: "Token expired, generate a new one" });

    user.password = password;

    await user.save();

    res.send();

  } catch (err) {
    res.status(400).send({ error: "Cannot reset password, please try again" });
  }
});

module.exports = (app) => app.use("/auth", router);
