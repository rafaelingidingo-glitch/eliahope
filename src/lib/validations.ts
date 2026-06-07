import { z } from 'zod'

/**
 * Zod Validation Schemas for API Routes
 * 
 * All input validation uses Zod v4 schemas for type-safe parsing.
 * Each schema corresponds to a specific API endpoint's expected input.
 */

// ─── Auth Schemas ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(200),
  password: z.string().min(1, 'Password is required').max(200),
})

export const forgotPasswordSchema = z.object({
  action: z.enum(['send_otp', 'verify_otp', 'resend_otp', 'reset_password']),
  email: z.string().email('Invalid email address').max(200),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(200).optional(),
  emailLogId: z.string().optional(),
})

// ─── Contact Schema ────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().max(50).optional(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(5000),
})

// ─── Newsletter Schema ─────────────────────────────────────────

export const newsletterSubscribeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address').max(200),
})

// ─── Donation Schemas ──────────────────────────────────────────

export const mpesaDonationSchema = z.object({
  donorName: z.string().min(1, 'Name is required').max(200),
  donorEmail: z.string().email().max(200).optional().or(z.literal('')),
  donorPhone: z.string().max(50).optional(),
  amount: z.number().positive('Amount must be positive').max(100000000),
  campaignId: z.string().optional(),
  campaign: z.string().max(200).optional(),
  provider: z.enum(['mpesa', 'airtel', 'tigo', 'halopesa', 'azampesa']).default('mpesa'),
  type: z.enum(['one_time', 'monthly']).default('one_time'),
})

export const crdbDonationSchema = z.object({
  donorName: z.string().min(1, 'Name is required').max(200),
  donorEmail: z.string().email().max(200).optional().or(z.literal('')),
  donorPhone: z.string().max(50).optional(),
  amount: z.number().positive('Amount must be positive').max(100000000),
  accountHolder: z.string().min(1, 'Account holder name is required').max(200),
  accountNumber: z.string().min(1, 'Account number is required').max(50),
  campaignId: z.string().optional(),
  campaign: z.string().max(200).optional(),
  otp: z.string().max(10).optional(),
  provider: z.enum(['crdb', 'nmb']).default('crdb'),
  type: z.enum(['one_time', 'monthly']).default('one_time'),
})

// ─── Admin CRUD Schemas ────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required').max(300),
  image: z.string().max(500).optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
})

export const galleryImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required').max(1000),
  title: z.string().max(200).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(500).optional(),
})

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(300),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  image: z.string().max(500).optional(),
  author: z.string().max(200).optional(),
  published: z.boolean().default(false),
})

export const volunteerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(200),
  phone: z.string().max(50).optional(),
  skills: z.string().max(500).optional(),
  motivation: z.string().max(2000).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'inactive']).default('pending'),
  programId: z.string().optional(),
})

export const childSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  age: z.number().int().min(0).max(30).optional(),
  gender: z.string().max(20).optional(),
  story: z.string().max(5000).optional(),
  photo: z.string().max(500).optional(),
  status: z.enum(['available', 'sponsored', 'graduated', 'inactive']).default('available'),
  program: z.string().max(200).optional(),
})

export const sponsorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(200),
  phone: z.string().max(50).optional(),
  childId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['monthly', 'quarterly', 'annually', 'one_time']).default('monthly'),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
})

export const settingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(200),
    value: z.string().max(5000),
  })).min(1),
})

export const newsletterBroadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(300),
  body: z.string().min(1, 'Body is required').max(50000),
  to: z.enum(['all', 'active']).default('all'),
})

export const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().min(1, 'Description is required'),
  goal: z.number().positive('Goal must be positive'),
  image: z.string().max(500).optional(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
})

export const donationUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'successful', 'failed', 'cancelled']),
})

export const paymentProofSchema = z.object({
  donorName: z.string().min(1, 'Name is required').max(200),
  donorPhone: z.string().min(1, 'Phone is required').max(50),
  amount: z.number().positive('Amount must be positive'),
  campaignId: z.string().optional(),
})

// ─── Type Inference Helpers ────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>
export type MpesaDonationInput = z.infer<typeof mpesaDonationSchema>
export type CrdbDonationInput = z.infer<typeof crdbDonationSchema>
export type EventInput = z.infer<typeof eventSchema>
export type GalleryImageInput = z.infer<typeof galleryImageSchema>
export type BlogPostInput = z.infer<typeof blogPostSchema>
export type VolunteerInput = z.infer<typeof volunteerSchema>
export type ChildInput = z.infer<typeof childSchema>
export type SponsorInput = z.infer<typeof sponsorSchema>
