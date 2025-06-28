"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Your Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z
    .string()
    .regex(/^[0-9]+$/, "Phone number must be digits only")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .min(1, "Phone Number is required"),
  message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          subject: `Contact Form Submission from ${data.name}`,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          variant:"added",
          description: "Your message has been sent successfully. We'll get back to you soon!",
        });
        reset(); // Reset form after successful submission
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          className="w-full rounded-2xl bg-creamey border border-gray-300 p-2 focus:border-everGreen focus:ring-everGreen"
          placeholder="Name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          {...register("email")}
          className="w-full rounded-2xl bg-creamey border border-gray-300 p-2 focus:border-everGreen focus:ring-everGreen"
          placeholder="Email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          {...register("phone")}
          className="w-full rounded-2xl bg-creamey border border-gray-300 p-2 focus:border-everGreen focus:ring-everGreen"
          placeholder="Phone"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className="w-full rounded-2xl bg-creamey border border-gray-300 p-2 focus:border-everGreen focus:ring-everGreen"
          placeholder="Message"
        ></textarea>
        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl hover:bg-creamey text-creamey bg-lovely p-3 text-lg font-semibold transition duration-300 ease-in-out hover:text-lovely disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
} 