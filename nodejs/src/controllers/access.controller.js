"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  async signUp(req, res, next) {
    const newUser = await AccessService.signUp(req.body);
    new CREATED("Sign in successfully", newUser).send(res);
  }

  async login(req, res, next) {
    new OK("Login successfully", await AccessService.login(req.body)).send(res);
  }

  async logout(req, res, next) {
    await AccessService.logout(req.user);
    new OK("Logout successfully").send(res);
  }

  async changePassword(req, res, next) {
    new OK(
      "Change password successfully",
      await AccessService.changePassword({
        userId: req.user.user_id,
        ...req.body,
      })
    ).send(res);
  }

  async getAccessToken(req, res, next) {
    new OK(
      "Get access token successfully",
      await AccessService.getAccessToken({
        userId: req.headers["x-client-id"],
        ...req.body,
      })
    ).send(res);
  }
}

module.exports = new AccessController();
