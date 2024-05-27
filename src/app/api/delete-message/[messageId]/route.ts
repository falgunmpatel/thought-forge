import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();
  const session = await auth();
  const user = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { message: "User not found!!", success: false },
      { status: 404 }
    );
  }

  //user._id is a string, so we need to convert it to ObjectId for using aggregation pipeline
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const updateResult = await UserModel.updateOne(
      { _id: userId },
      {
        $pull: {
          messages: {
            _id: new mongoose.Types.ObjectId(params.messageId),
          },
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted!!", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message deleted!!", success: true },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Error deleting message!!", success: false },
      { status: 500 }
    );
  }
}
