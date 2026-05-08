const mongoose = require("mongoose");
const crypto = require("crypto");

const PBKDF2_ITERATIONS = 310000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = "sha256";

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordSalt: {
      type: String,
      required: true,
      select: false,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    profileImageURL: {
      type: String,
      default: "",
      trim: true,
    },
    profileDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Virtual setter so callers can do: user.password = "plaintext"
UserSchema.virtual("password").set(function setPassword(plaintext) {
  if (typeof plaintext !== "string" || plaintext.length < 8) {
    throw new Error("Password must be a string of at least 8 characters.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  this.passwordSalt = salt;
  this.passwordHash = hashPassword(plaintext, salt);
});

UserSchema.methods.verifyPassword = function verifyPassword(plaintext) {
  if (!this.passwordSalt || !this.passwordHash) return false;
  const candidate = hashPassword(plaintext, this.passwordSalt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(this.passwordHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

