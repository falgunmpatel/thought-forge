import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function POST(request: Request) {
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

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const user = await UserModel.findByIdAndUpdate(
            userId ,
            { isAcceptingMessages : acceptMessages },
            { new: true }
        );

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        };

        return Response.json(
            {
                success: true,
                message: "User accept message status changed successfully"
            }
        )
    } catch (error) {
        console.log("Error accepting messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to change user status to accept messages " + error
            },
            {
                status: 500
            }
        )
    }
}


export async function GET(request: Request) {
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

    const userId = user._id;

    try {
        const user = await UserModel.findById(userId);

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        return Response.json(
          {
            success: true,
            isAcceptingMessages: user.isAcceptingMessage,
          },
          {
            status: 200,
          }
        );
        
    } catch (error) {
        console.log("Error accepting messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get user status to accept messages " + error
            },
            {
                status: 500
            }
        )
    }
}