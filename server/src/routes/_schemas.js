import { z } from "zod";

export const authRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional().default("")
  })
});

export const authLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

export const seedCreateSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    type: z.string().min(2),
    quantity: z.coerce.number().int().min(1),
    price: z.coerce.number().min(0),     // ✅ add
    currency: z.string().optional().default("INR"), // ✅ optional
    description: z.string().optional().default(""),
    lng: z.coerce.number(),
    lat: z.coerce.number()
  })
});

export const seedNearSchema = z.object({
  query: z.object({
    lng: z.coerce.number(),
    lat: z.coerce.number(),
    radiusKm: z.coerce.number().min(0.1).max(50).default(5)
  })
});

export const exchangeCreateSchema = z.object({
  body: z.object({
    listingId: z.string().min(8),
    kind: z.enum(["EXCHANGE", "BUY"]).default("EXCHANGE"),
    offeredPrice: z.coerce.number().min(0).optional(),
    offeredListingId: z.string().optional(),
    message: z.string().max(500).optional().default("")
  })
});


export const feedCreateSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(800)
  })
});

export const feedUpdateSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(800)
  })
});

// Company verification schemas
export const companyInitiateSchema = z.object({
  body: z.object({
    gstNumber: z.string()
      .min(15, "GST number must be 15 characters")
      .max(15, "GST number must be 15 characters")
      .transform(val => val.toUpperCase()),
    companyName: z.string().min(2, "Company name is required").max(200)
  })
});

export const companyVerifyOtpSchema = z.object({
  body: z.object({
    otp: z.string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be 6 digits")
  })
});

// Password reset schemas
export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email address")
  })
});

export const passwordVerifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(6).max(6).regex(/^\d{6}$/, "OTP must be 6 digits")
  })
});

export const passwordResetSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(6).max(6).regex(/^\d{6}$/, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
  })
});

