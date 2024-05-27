import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    //Use decodeURIComponent as the username may contain special characters and URL will encode them to %20, %21, etc.
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { message: "User not found!!", success: false },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      user.verifyCode = "";
      user.verifyCodeExpiry = new Date(0);
      await user.save();
      return Response.json(
        { message: "User verified successfully!!", success: true },
        { status: 200 }
      );
    } else if (!isCodeValid) {
      return Response.json(
        { message: "Invalid verification code!!", success: false },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          message:
            "Verification code has expired, please sign up again to get new verification code!!",
          success: false,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.log("Verify Code :: Error: ", error);
    return Response.json(
      { message: "Error verifying user!!", success: false },
      { status: 500 }
    );
  }
}
