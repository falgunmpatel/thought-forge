import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authencaited"
            },
            {
                status: 401
            }
        )
    }

    try {
        const deleteMessage = await UserModel.updateOne(
            {
                _id: user._id
            },
            {
                $pull: {
                    messages: {
                        _id: new mongoose.Types.ObjectId(params.messageId)
                    }
                }
            }
        );

        if (deleteMessage.modifiedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found"
                },
                {
                    status: 404
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Message deleted"
            },
            {
                status: 200
            }
        )
    } catch (error: any) {
        return Response.json(
            {
                success: false,
                message: "Failed to get messages " + error
            },
            {
                status: 500
            }
        )
    }
}