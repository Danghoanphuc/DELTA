// src/modules/auth/auth.repository.js
import { User } from "../../shared/models/user.model.js";
import Session from "../../shared/models/session.model.js";

export class AuthRepository {
  async findUserByEmail(email, selectOptions = "") {
    return await User.findOne({ email }).select(selectOptions);
  }

  async findUserById(userId) {
    return await User.findById(userId).select("-hashedPassword");
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByVerificationToken(token) {
    return await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpiresAt");
  }

  async saveUser(user) {
    return await user.save();
  }

  async createSession(sessionData) {
    return await Session.create(sessionData);
  }

  async findSessionByToken(refreshToken) {
    return await Session.findOne({ refreshToken });
  }

  async deleteSession(sessionId) {
    return await Session.deleteOne({ _id: sessionId });
  }

  async deleteSessionByToken(refreshToken) {
    return await Session.deleteOne({ refreshToken });
  }
}
