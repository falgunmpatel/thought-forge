import { DB_Name } from "@/constants";
import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  //IMPORTANT!!! NextJS runs on edge servers, so we need to check if the connection is already established
  if (connection.isConnected) {
    console.log("Already connected to DB!!");
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_Name}` || "",
      {}
    );

    //TODO: log the connectionInstance object to see what it contains also log the connectionInstance.connections
    // console.log("connectionInstance :: ", connectionInstance);
    // console.log(
    //   "connectionInstance.connections :: ",
    //   connectionInstance.connections
    // );

    connection.isConnected = connectionInstance.connections[0].readyState;

    console.log(
      "MongoDB Connected!! DB Host :: ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error connecting to DB :: ", error);
    process.exit(1);
  }
}

export default dbConnect;
