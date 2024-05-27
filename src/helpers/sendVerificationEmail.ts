import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "ThoughtForge | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    // console.log("Email sent successfully: ", response);
    if (response.error) {
      console.log("Error sending verification email: ", response.error);
      return {
        success: false,
        message: "Verification email could not be sent!!",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully!!",
    };
  } catch (emailError) {
    console.error("Error sending verification email: ", emailError);
    return {
      success: false,
      message: "Verification email could not be sent!!",
    };
  }
}
