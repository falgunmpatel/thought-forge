import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { verifySchema } from "@/schemas/verifySchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // validate with zod
    const validatedCode = verifySchema.safeParse({ code });

    if (!validatedCode.success) {
      const errorMessage = validatedCode.error.format().code?._errors || [];
      return Response.json(
        {
          success: false,
          message: "Invalid code " + errorMessage.join(", "),
        },
        {
          status: 400,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry!) > new Date();

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid code",
        },
        {
          status: 400,
        }
      );
    }

    if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Code expired",
        },
        {
          status: 400,
        }
      );
    }

    user.isVerified = true;

    await user.save();

    return Response.json(
      {
        success: true,
        message: "User verified successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("ERROR WHILE VERIFYING CODE", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
