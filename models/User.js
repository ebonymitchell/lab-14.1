import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the user schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        }
    },
    {
        timestamps: true
    }
);

// Hash passwords before saving new or updated users
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare an incoming password with the stored hash
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
