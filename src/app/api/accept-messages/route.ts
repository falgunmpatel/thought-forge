import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();
  const session = await auth();
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { message: "Not authenticated!!", success: false },
      { status: 401 }
    );
  }
  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { message: "User not found!!", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: acceptMessages
          ? "status updated to accept messages!!"
          : "status updated to not accept messages!!",
        success: true,
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "failed to updated status to accept messages!!",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const session = await auth();
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { message: "Not authenticated!!", success: false },
      { status: 401 }
    );
  }
  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        { message: "User not found!!", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "failed to get user message acceptance status!!",
        success: false,
      },
      { status: 500 }
    );
  }
}
