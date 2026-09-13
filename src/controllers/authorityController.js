const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Authority = require("../models/Authority");

const createAuthority = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        if (!name || !email || !password || !department) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingAuthority = await Authority.findOne({ email });

        if (existingAuthority) {
            return res.status(400).json({
                message: "Authority already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authority = await Authority.create({
            name,
            email,
            password: hashedPassword,
            department
        });

        res.status(201).json({
            message: "Authority created successfully",
            authority: {
                id: authority._id,
                name: authority.name,
                email: authority.email,
                department: authority.department,
                role: authority.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create authority",
            error: error.message
        });
    }
};


const authorityLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const authority = await Authority.findOne({ email });

        if (!authority) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            authority.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: authority._id,
                role: authority.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Authority login successful",
            token,
            authority: {
                id: authority._id,
                name: authority.name,
                email: authority.email,
                department: authority.department,
                role: authority.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Authority login failed",
            error: error.message
        });
    }
};


module.exports = {
    createAuthority,
    authorityLogin
};
