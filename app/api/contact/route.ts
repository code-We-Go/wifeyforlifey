import { sendContactMail } from "@/lib/contactMail";
// import { sendMail } from "@/app/lib/email";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const  data  = await request.json();
    console.log(data.name)
    try{
        await sendContactMail({
            to:'support@shopwifeyforlifey.com',
            name: data.name,
            subject: 'Contact-Mail',
            from: data.email,
            body: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nMessage:\n${data.message}`
    });
    return NextResponse.json({status: 200 })
    }
    catch(error){
        return NextResponse.json({status:400})
    }
}