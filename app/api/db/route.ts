import { NextResponse } from "next/server";
import { ConnectDB } from "../../config/db";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();

export async function GET() {
  return NextResponse.json(
    {
      data: "hamada",
    },
    { status: 200 }
  );
}
