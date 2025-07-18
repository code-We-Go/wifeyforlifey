import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
// Simplified auth for testing
const auth = (req: Request) => ({ id: "test-user" });
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  // imageUploader: f(
  //   { image: { maxFileCount:10,maxFileSize: "256MB" } },
  // )
  mediaUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    // Set permissions and file types for this FileRoute
    // .middleware(async ({ req }) => {
    //   // This code runs on your server before upload
    //   const user = await auth(req);
 
    //   // If you throw, the user will not be able to upload
    //   if (!user) throw new UploadThingError("Unauthorized");
 
    //   // Whatever is returned here is accessible in onUploadComplete as `metadata`
    //   return { userId: user.id };
    // })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
    //   console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
    //   return { uploadedBy: metadata.userId };
      return { url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;