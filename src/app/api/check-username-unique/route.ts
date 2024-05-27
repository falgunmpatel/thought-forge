import React from "react";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import UserModel from "@/model/User";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    //validate with zod
    const result = UsernameQuerySchema.safeParse(queryParams);
    //TODO: Study more about the result object
    console.log("Check Username Unique :: result: ", result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid username!!",
          success: false,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        { message: "Username is already taken!!", success: false },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "Username is available!!", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Check Username Unique :: Error: ", error);
    return Response.json(
      { message: "Error checking username!!", success: false },
      { status: 500 }
    );
  }
}
