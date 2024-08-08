import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with zod
    const validatedQuery = UsernameQuerySchema.safeParse(queryParam);

    if (!validatedQuery.success) {
      const errorMessage =
        validatedQuery.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: "Invalid username " + errorMessage.join(", "),
        },
        {
          status: 400,
        }
      );
    }

    const { username } = validatedQuery.data;

    const user = await UserModel.findOne({ username, isVerified: true });

    if (user) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available!!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error while checking unique username :: ", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking unique username",
      },
      {
        status: 500,
      }
    );
  }
}