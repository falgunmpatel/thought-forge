import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

/**
 * This function handles the POST request for user registration.
 * It first connects to the database, then it extracts the username, email, and password from the request.
 * It checks if any of these fields are empty, if so, it returns a response with an error message.
 * It then checks if a verified user with the same username already exists, if so, it returns a response with an error message.
 * It then checks if a user with the same email already exists.
 * If a user with the same email exists and is verified, it returns a response with an error message.
 * If a user with the same email exists but is not verified, it updates the user's password and verification code, and sets the verification code expiry to 1 hour from now.
 * If no user with the same email exists, it creates a new user with the provided username, email, and password, and sets the verification code and its expiry.
 * It then sends a verification email to the user.
 * If the email is sent successfully, it returns a response indicating successful registration.
 * If the email is not sent successfully, it returns a response with an error message.
 * If any error occurs during this process, it logs the error and returns a response with an error message.
 *
 * @param {Request} request - The request object from the client.
 * @returns {Response} - The response object to be sent to the client.
 */

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();

        if (
            [username, email, password].some((data) => !data || data.trim() === "")
        ) {
            return Response.json({
                success: false,
                message: "username, email and password are required"
            })
        }

        const existingUserVerifiedByUserName = await UserModel.findOne({
            username,
            isVerified: true
        })

        // check wether user already exist
        if (existingUserVerifiedByUserName) {
            return Response.json({
                success: false,
                message: "Username already exist"
            }, {
                status: 400
            });
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // check wether user already exist
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User with this email already exist"
                }, {
                    status: 400
                });
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            await UserModel.create({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });

        }

        // send verification email
        const emailRespose = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        // check if email sent successfully
        if (!emailRespose.success) {
            return Response.json(
                {
                    sucess: false,
                    message: emailRespose.message
                }, {
                status: 500
            }
            )
        }

        return Response.json(
            {
                success: true,
                message: "User registered successfully"
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error("ERROR WHILE REGISTRING USER", error);
        return Response.json(
            {
                success: false,
                message: "Error while registring user"
            },
            {
                status: 500
            }
        );
    }
}
