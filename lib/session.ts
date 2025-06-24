import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string,email:string) {
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    const session = await encrypt({ userId,email ,expiresAt });
const cookie =await cookies()
   cookie.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
  
}

export async function deleteSession() {
  const session = 'omar'

  const cookie =await cookies()
  cookie.set("session", session,{
   httpOnly: true,
   secure: true,
   expires:new Date(Date.now()) ,
 });
}

type SessionPayload = {
  userId: string;
  email:string
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
      if (session){
        console.log(session);

        const { payload } = await jwtVerify(session, encodedKey, {
          algorithms: ["HS256"],
        });
        return payload;
      } 
    }
    catch (error) {
    console.log("Failed to verify session");
  }
}