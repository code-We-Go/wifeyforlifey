import { sendContactMail } from "@/app/lib/contactMail";
import { sendMail } from "@/app/lib/email";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const  data  = await request.json();
    console.log(data.name)
    try{
        await sendContactMail({
            to:'orders@mamilk-breastfeeding.com',
            name: data.name,
            subject: data.subject,
            from: data.email,
            body: data.message
    });
    return NextResponse.json({status: 200 })
    }
    catch(error){
        return NextResponse.json({status:400})
    }
}