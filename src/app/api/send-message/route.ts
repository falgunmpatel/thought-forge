import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
    await dbConnect();
    const {username , content} = await request.json();
    try {
        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        // check if user is accepting messages
        if(!user.isAcceptingMessages){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                },
                {
                    status: 403
                }
            );
        }

        const message = {
            content,
            createdAt: new Date()
        };

        user.messages.push(message as Message);
        await user.save();
        return Response.json(
            {
                success: true,
                message: "Message sent successfully"
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.log("Error in sending message: ", error);
        return Response.json(
            {
                success: false,
                message: "Failed to send message " + error
            },
            {
                status: 500
            }
        );
    }
}