import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function GET(request: Request) {
  await dbConnect();
  const session = await auth();
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { message: "User not found!!", success: false },
      { status: 404 }
    );
  }

  //user._id is a string, so we need to convert it to ObjectId for using aggregation pipeline
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $unwind: "$messages",
      },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          message: "No messages found!!",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json({ messages: user[0].messages, success: true });
  } catch (error) {
    return Response.json(
      { message: "Failed to get messages!!", success: false },
      { status: 500 }
    );
  }
}
