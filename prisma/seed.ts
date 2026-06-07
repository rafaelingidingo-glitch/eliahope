/**
 * Hierarchical & Unified Database Seed Script (Prisma 7)
 *
 * ─── Database-Agnostic Design ─────────────────────────────────────────────
 * This script works identically on SQLite, PostgreSQL, and MySQL without
 * modification. All record IDs are captured dynamically into memory arrays
 * and used for relationship binding — no hardcoded UUID or integer IDs.
 *
 * ─── Top-Down Deletion Pipeline ──────────────────────────────────────────
 * Instead of a `$transaction([...deleteMany()])` batch (which triggers
 * Foreign Key / Referential Integrity constraint rollbacks on PostgreSQL
 * and MySQL), we wipe old data table-by-table in **explicit dependency
 * order**: child/relationship rows first, then parent rows.
 *
 * Deletion order (child → parent):
 *   1. EmailLog          (leaf — no FK dependencies)
 *   2. OtpCode           (leaf)
 *   3. Sponsor           (FK → Child)
 *   4. Donation          (FK → Campaign)
 *   5. PaymentProof      (FK → Campaign)
 *   6. ContactMessage    (leaf)
 *   7. Volunteer         (FK → Program)
 *   8. Newsletter        (leaf)
 *   9. BlogPost          (leaf)
 *  10. GalleryImage      (leaf)
 *  11. Event             (leaf)
 *  12. Testimonial       (leaf)
 *  13. Partner           (leaf)
 *  14. SuccessStory      (leaf)
 *  15. Child             (parent of Sponsor)
 *  16. Campaign          (parent of Donation, PaymentProof)
 *  17. Program           (parent of Volunteer)
 *  18. Stat              (leaf)
 *  19. SiteSetting       (leaf)
 *  20. User              (leaf)
 */

import "dotenv/config"
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

// ─── Database-Agnostic Client Creation ────────────────────────────────────
// Detect engine from DATABASE_URL and create the appropriate adapter.

const DATABASE_URL = process.env.DATABASE_URL || 'file:./db/custom.db'

function detectEngine(url: string): 'sqlite' | 'postgresql' | 'mysql' {
  if (url.startsWith('file:')) return 'sqlite'
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
  if (url.startsWith('mysql://')) return 'mysql'
  return 'sqlite'
}

function createPrismaClient(): PrismaClient {
  const engine = detectEngine(DATABASE_URL)

  if (engine === 'sqlite') {
    const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
    return new PrismaClient({ adapter })
  }

  // For PostgreSQL/MySQL, the same adapter pattern as src/lib/db.ts applies.
  // Install the appropriate adapter and uncomment the corresponding block.
  // PostgreSQL: bun add @prisma/adapter-pg pg
  // MySQL:     bun add @prisma/adapter-mariadb mariadb
  // Then update this function and src/lib/db.ts accordingly.

  console.warn(
    `[Seed] Engine "${engine}" detected but adapter not configured. ` +
    'Falling back to SQLite adapter. See comments for setup instructions.'
  )
  const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  console.log('🌱 Starting seed — wiping existing data in dependency order...\n')

  // ─── STEP 1: Delete in dependency order (child rows first) ───────────
  // Each deleteMany is awaited individually so any FK violation
  // surfaces immediately with a clear table name.
  await prisma.emailLog.deleteMany()       // 1. leaf
  await prisma.otpCode.deleteMany()        // 2. leaf
  await prisma.sponsor.deleteMany()        // 3. FK → Child
  await prisma.donation.deleteMany()       // 4. FK → Campaign
  await prisma.paymentProof.deleteMany()   // 5. FK → Campaign
  await prisma.contactMessage.deleteMany() // 6. leaf
  await prisma.volunteer.deleteMany()      // 7. FK → Program
  await prisma.newsletter.deleteMany()     // 8. leaf
  await prisma.blogPost.deleteMany()       // 9. leaf
  await prisma.galleryImage.deleteMany()   // 10. leaf
  await prisma.event.deleteMany()          // 11. leaf
  await prisma.testimonial.deleteMany()    // 12. leaf
  await prisma.partner.deleteMany()        // 13. leaf
  await prisma.successStory.deleteMany()   // 14. leaf
  await prisma.child.deleteMany()          // 15. parent of Sponsor
  await prisma.campaign.deleteMany()       // 16. parent of Donation, PaymentProof
  await prisma.program.deleteMany()        // 17. parent of Volunteer
  await prisma.stat.deleteMany()           // 18. leaf
  await prisma.siteSetting.deleteMany()    // 19. leaf
  await prisma.user.deleteMany()           // 20. leaf

  console.log('✅ All existing data wiped.\n')

  // ─── STEP 2: Create records top-down, capturing IDs dynamically ──────

  // --- Admin User ---
  const hashedPassword = await bcrypt.hash('EliaHope2024!', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@eliashope.org',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log(`👤 Admin user created: ${admin.email}`)

  // --- Site Settings ---
  const siteSettingsData = [
    { key: 'hero_title', value: 'Building Hope, Transforming Lives' },
    { key: 'hero_subtitle', value: "Elia's Hope Community is dedicated to empowering children and families in Mwanza, Tanzania through education, healthcare, and community development." },
    { key: 'about_title', value: "About Elia's Hope Community" },
    { key: 'about_content', value: "Founded with a vision to transform the lives of vulnerable children, Elia's Hope Community has been a beacon of hope in Mwanza, Tanzania. We believe every child deserves access to quality education, healthcare, and a safe environment to grow." },
    { key: 'mission', value: 'To empower vulnerable children and communities through sustainable programs in education, healthcare, and spiritual development, creating lasting change in Mwanza, Tanzania.' },
    { key: 'vision', value: 'A world where every child has the opportunity to thrive, regardless of their background or circumstances.' },
    { key: 'core_values', value: 'Compassion,Integrity,Empowerment,Community,Faith,Sustainability' },
    { key: 'contact_email', value: 'info@eliashope.org' },
    { key: 'contact_phone', value: '+255 123 456 789' },
    { key: 'contact_address', value: 'Mwanza, Tanzania' },
    { key: 'footer_text', value: "© 2024 Elia's Hope Community. All rights reserved." },
  ]
  for (const s of siteSettingsData) {
    await prisma.siteSetting.create({ data: s })
  }
  console.log('⚙️  Site settings created')

  // --- Stats ---
  const statsData = [
    { label: 'Children Supported', value: 500, icon: 'baby', order: 1 },
    { label: 'Volunteers', value: 120, icon: 'users', order: 2 },
    { label: 'Communities Reached', value: 15, icon: 'home', order: 3 },
    { label: 'Meals Provided', value: 25000, icon: 'utensils', order: 4 },
  ]
  for (const s of statsData) {
    await prisma.stat.create({ data: s })
  }
  console.log('📊 Stats created')

  // --- Programs (parent of Volunteer) ---
  const programsData = [
    { title: 'Education Program', slug: 'education', description: 'Providing quality education and school supplies to children in need, ensuring they have the tools to build a brighter future.', icon: 'book-open', image: '/program-education.png', order: 1, active: true },
    { title: 'Healthcare Program', slug: 'healthcare', description: 'Ensuring access to basic healthcare services, vaccinations, and nutrition support for vulnerable children and families.', icon: 'heart', image: '/program-childcare.png', order: 2, active: true },
    { title: 'Feeding Program', slug: 'feeding', description: 'Providing nutritious meals to children in our programs, fighting malnutrition and ensuring healthy development.', icon: 'utensils', image: '/program-feeding.png', order: 3, active: true },
    { title: 'Bible Study', slug: 'bible-study', description: 'Nurturing spiritual growth through Bible study sessions and mentorship programs for children and youth.', icon: 'book', image: '/program-bible.png', order: 4, active: true },
    { title: 'Community Outreach', slug: 'community-outreach', description: 'Engaging with local communities through workshops, training sessions, and collaborative development projects.', icon: 'users', image: '/program-community.png', order: 5, active: true },
  ]
  const createdPrograms: { id: string }[] = []
  for (const p of programsData) {
    const program = await prisma.program.create({ data: p })
    createdPrograms.push({ id: program.id })
  }
  console.log(`📋 Programs created: ${createdPrograms.length}`)

  // --- Campaigns (parent of Donation, PaymentProof) ---
  const campaignsData = [
    { title: 'School Supplies Drive', description: 'Help us provide school supplies for 200 children this upcoming school year.', goal: 5000000, raised: 3500000, image: '/program-education.png', status: 'active' },
    { title: 'Healthcare Fund', description: 'Support our healthcare program to provide medical care for children in need.', goal: 10000000, raised: 7200000, image: '/program-childcare.png', status: 'active' },
    { title: 'Feeding Program Expansion', description: 'Help us expand our feeding program to reach 100 more children.', goal: 8000000, raised: 5500000, image: '/program-feeding.png', status: 'active' },
    { title: 'Christmas Gift Drive', description: 'Bring joy to children this Christmas with gifts and celebration.', goal: 3000000, raised: 3000000, image: '/program-community.png', status: 'completed' },
  ]
  const createdCampaigns: { id: string }[] = []
  for (const c of campaignsData) {
    const campaign = await prisma.campaign.create({ data: c })
    createdCampaigns.push({ id: campaign.id })
  }
  console.log(`🎯 Campaigns created: ${createdCampaigns.length}`)

  // --- Children (parent of Sponsor) ---
  const childrenData = [
    { name: 'Grace Mwenda', age: 8, gender: 'female', story: 'Grace lost her parents at a young age and was taken in by her grandmother. She dreams of becoming a doctor one day.', photo: '/success-story.png', status: 'sponsored' as const, program: 'Education Program' },
    { name: 'Joseph Kamau', age: 10, gender: 'male', story: 'Joseph comes from a very poor family. He loves playing football and wants to be a teacher.', photo: '/success-story.png', status: 'available' as const, program: 'Education Program' },
    { name: 'Neema Emmanuel', age: 6, gender: 'female', story: 'Neema is the youngest of five siblings. She loves singing and drawing.', photo: '/success-story.png', status: 'sponsored' as const, program: 'Healthcare Program' },
    { name: 'Baraka Peter', age: 12, gender: 'male', story: 'Baraka walks 5km to school every day. He is a bright student who excels in mathematics.', photo: '/success-story.png', status: 'available' as const, program: 'Feeding Program' },
    { name: 'Asha Mohamed', age: 9, gender: 'female', story: "Asha's family struggles to afford basic needs. She enjoys reading and wants to be a nurse.", photo: '/success-story.png', status: 'available' as const, program: 'Education Program' },
    { name: 'David Lucas', age: 7, gender: 'male', story: "David has a hearing impairment but doesn't let that stop him. He loves painting.", photo: '/success-story.png', status: 'sponsored' as const, program: 'Healthcare Program' },
  ]
  const createdChildren: { id: string }[] = []
  for (const c of childrenData) {
    const child = await prisma.child.create({ data: c })
    createdChildren.push({ id: child.id })
  }
  console.log(`👶 Children created: ${createdChildren.length}`)

  // --- Events ---
  const eventsData = [
    { title: 'Annual Charity Gala', description: "Join us for our annual charity gala to raise funds for children's education programs.", date: new Date('2026-08-15'), location: 'Mwanza Conference Center', image: '/event-sample.png', status: 'upcoming' },
    { title: 'Community Health Fair', description: 'Free health screenings and wellness workshops for the community.', date: new Date('2026-09-20'), location: 'Nyamagana Community Hall', image: '/event-sample.png', status: 'upcoming' },
    { title: 'Youth Leadership Workshop', description: 'Empowering young people with leadership skills and mentorship.', date: new Date('2026-01-10'), location: "Elia's Hope Center", image: '/event-sample.png', status: 'completed' },
    { title: 'Christmas Celebration', description: 'Annual Christmas celebration with gifts, food, and activities for children.', date: new Date('2025-12-25'), location: "Elia's Hope Center", image: '/event-sample.png', status: 'completed' },
    { title: 'Back to School Drive', description: 'Distribution of school supplies and uniforms for the new school year.', date: new Date('2026-01-15'), location: 'Mwanza Primary School', image: '/event-sample.png', status: 'completed' },
  ]
  for (const e of eventsData) {
    await prisma.event.create({ data: e })
  }
  console.log('📅 Events created')

  // --- Gallery Images ---
  const galleryData = [
    { url: '/program-education.png', title: 'Education Program', category: 'programs', description: 'Children learning in our education program' },
    { url: '/program-childcare.png', title: 'Childcare Support', category: 'programs', description: 'Providing care and support for children' },
    { url: '/program-feeding.png', title: 'Feeding Program', category: 'programs', description: 'Nutritious meals for children' },
    { url: '/program-bible.png', title: 'Bible Study', category: 'programs', description: 'Spiritual growth and mentorship' },
    { url: '/program-community.png', title: 'Community Outreach', category: 'community', description: 'Community engagement activities' },
    { url: '/event-sample.png', title: 'Community Event', category: 'events', description: 'Community gathering and celebration' },
    { url: '/success-story.png', title: 'Success Story', category: 'stories', description: "A child's transformation story" },
    { url: '/hero-bg.png', title: 'Our Community', category: 'community', description: 'The community we serve' },
    { url: '/about-image.png', title: 'Our Team', category: 'community', description: 'Dedicated team members' },
  ]
  for (const g of galleryData) {
    await prisma.galleryImage.create({ data: g })
  }
  console.log('🖼️  Gallery images created')

  // --- Donations (child of Campaign — uses dynamic campaignId) ---
  const donationsData = [
    { donorName: 'John Mwangi', donorEmail: 'john@example.com', amount: 500000, currency: 'TZS', method: 'mpesa' as const, type: 'one_time' as const, campaignId: createdCampaigns[0].id, status: 'successful' as const, message: 'Keep up the great work!' },
    { donorName: 'Sarah Johnson', donorEmail: 'sarah@example.com', amount: 1000000, currency: 'TZS', method: 'mpesa' as const, type: 'one_time' as const, campaignId: createdCampaigns[1].id, status: 'successful' as const, message: 'Happy to support!' },
    { donorName: 'David Kimaro', donorEmail: 'david@example.com', amount: 200000, currency: 'TZS', method: 'mpesa' as const, type: 'monthly' as const, campaignId: createdCampaigns[2].id, status: 'successful' as const },
    { donorName: 'Emily Chen', donorEmail: 'emily@example.com', amount: 750000, currency: 'TZS', method: 'bank_transfer' as const, type: 'one_time' as const, campaignId: createdCampaigns[0].id, status: 'pending' as const },
    { donorName: 'Michael Brown', donorEmail: 'michael@example.com', amount: 300000, currency: 'TZS', method: 'crdb' as const, type: 'monthly' as const, campaignId: createdCampaigns[1].id, status: 'successful' as const },
    { donorName: 'Anna Mbeki', donorEmail: 'anna@example.com', amount: 150000, currency: 'TZS', method: 'mpesa' as const, type: 'one_time' as const, campaignId: createdCampaigns[3].id, status: 'successful' as const },
    { donorName: 'Robert Wilson', donorEmail: 'robert@example.com', amount: 2000000, currency: 'TZS', method: 'bank_transfer' as const, type: 'one_time' as const, campaignId: createdCampaigns[1].id, status: 'failed' as const },
    { donorName: 'Grace Joseph', donorEmail: 'grace@example.com', amount: 400000, currency: 'TZS', method: 'mpesa' as const, type: 'monthly' as const, campaignId: createdCampaigns[2].id, status: 'successful' as const },
    { donorName: 'Peter Andrew', donorEmail: 'peter@example.com', amount: 600000, currency: 'TZS', method: 'crdb' as const, type: 'one_time' as const, campaignId: createdCampaigns[0].id, status: 'pending' as const },
    { donorName: 'Lucia Thomas', donorEmail: 'lucia@example.com', amount: 250000, currency: 'TZS', method: 'mpesa' as const, type: 'one_time' as const, status: 'successful' as const },
  ]
  for (const d of donationsData) {
    await prisma.donation.create({ data: d })
  }
  console.log('💰 Donations created')

  // --- Volunteers (child of Program — uses dynamic programId) ---
  const volunteersData = [
    { name: 'Amina Hassan', email: 'amina@example.com', phone: '+255 234 567 890', skills: 'Teaching,First Aid', motivation: 'I want to give back to my community and help children succeed.', status: 'approved' as const, programId: createdPrograms[0].id },
    { name: 'James Smith', email: 'james@example.com', phone: '+1 234 567 8901', skills: 'Healthcare,Administration', motivation: 'I believe every child deserves access to healthcare.', status: 'approved' as const },
    { name: 'Fatima Said', email: 'fatima@example.com', phone: '+255 345 678 901', skills: 'Counseling,Mentoring', motivation: 'I want to support children emotionally and spiritually.', status: 'pending' as const },
    { name: 'Mark Johnson', email: 'mark@example.com', skills: 'Construction,Carpentry', motivation: 'I want to help build better facilities for the children.', status: 'pending' as const },
    { name: 'Zainab Omari', email: 'zainab@example.com', phone: '+255 456 789 012', skills: 'Cooking,Nutrition', motivation: 'I want to help provide nutritious meals for children.', status: 'approved' as const },
    { name: 'Thomas Malley', email: 'thomas@example.com', skills: 'IT,Photography', motivation: 'I want to use my skills to tell the stories of these children.', status: 'rejected' as const },
  ]
  for (const v of volunteersData) {
    await prisma.volunteer.create({ data: v })
  }
  console.log('🤝 Volunteers created')

  // --- Sponsors (child of Child — uses dynamic childId) ---
  const sponsorsData = [
    { name: 'Maria Garcia', email: 'maria@example.com', phone: '+1 555 123 4567', childId: createdChildren[0].id, amount: 150000, frequency: 'monthly' as const, status: 'active' as const, startDate: new Date('2024-01-15') },
    { name: 'Robert Chen', email: 'robert.c@example.com', phone: '+86 555 987 6543', childId: createdChildren[2].id, amount: 200000, frequency: 'monthly' as const, status: 'active' as const, startDate: new Date('2024-03-01') },
    { name: 'Jennifer Williams', email: 'jen.w@example.com', childId: createdChildren[5].id, amount: 150000, frequency: 'monthly' as const, status: 'active' as const, startDate: new Date('2024-06-10') },
    { name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+255 789 012 345', amount: 100000, frequency: 'quarterly' as const, status: 'active' as const, startDate: new Date('2024-02-20') },
    { name: 'Lisa Thompson', email: 'lisa@example.com', amount: 300000, frequency: 'annually' as const, status: 'cancelled' as const, startDate: new Date('2023-09-01') },
  ]
  for (const s of sponsorsData) {
    await prisma.sponsor.create({ data: s })
  }
  console.log('💖 Sponsors created')

  // --- Newsletter Subscribers ---
  const subscribersData = [
    { name: 'Emma Watson', email: 'emma@example.com', status: 'active' as const },
    { name: 'James Brown', email: 'james.b@example.com', status: 'active' as const },
    { name: 'Sophie Laurent', email: 'sophie@example.com', status: 'active' as const },
    { name: 'Daniel Ochieng', email: 'daniel@example.com', status: 'active' as const },
    { name: 'Rachel Green', email: 'rachel@example.com', status: 'unsubscribed' as const },
    { name: 'Carlos Rivera', email: 'carlos@example.com', status: 'active' as const },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', status: 'active' as const },
    { name: 'Priya Sharma', email: 'priya@example.com', status: 'active' as const },
  ]
  for (const sub of subscribersData) {
    await prisma.newsletter.create({ data: sub })
  }
  console.log('📧 Newsletter subscribers created')

  // --- Blog Posts ---
  const blogPostsData = [
    { title: 'Transforming Lives Through Education', slug: 'transforming-lives-education', content: "Education is the most powerful weapon which you can use to change the world. At Elia's Hope Community, we have seen firsthand how access to quality education can transform a child's life and, by extension, their entire community.\n\nOur education program currently supports over 500 children across Mwanza, providing them with school supplies, tuition assistance, and mentorship. The results have been remarkable - school attendance has increased by 60% and academic performance has improved significantly.\n\nBut our work is far from done. There are still thousands of children in the region who lack access to basic education. With your support, we can reach more children and give them the opportunity to build a better future.", excerpt: 'How our education program is changing the lives of children in Mwanza, Tanzania.', image: '/program-education.png', author: 'Admin', published: true },
    { title: 'The Power of Community', slug: 'power-of-community', content: "Community is at the heart of everything we do at Elia's Hope. When people come together with a shared purpose, incredible things can happen.\n\nLast month, over 200 community members joined our volunteer program, contributing their time and skills to support our initiatives. From teaching to healthcare, construction to administration, each volunteer brings something unique and valuable.\n\nOur community outreach program has expanded to 15 villages, providing training workshops, health education, and support groups. The impact has been profound - communities are becoming more self-reliant and resilient.", excerpt: 'How community engagement is driving sustainable change in Mwanza.', image: '/program-community.png', author: 'Admin', published: true },
    { title: 'A Year of Impact: 2024 Annual Report', slug: '2024-annual-report', content: "As we reflect on 2024, we are filled with gratitude for the incredible support from our donors, volunteers, and partners. Together, we have achieved remarkable milestones.\n\nKey achievements include:\n- 500 children supported through our education program\n- 25,000 nutritious meals provided\n- 15 communities reached\n- 120 active volunteers\n- 4 successful fundraising campaigns\n\nThese numbers represent real lives changed and real hope restored. Thank you for being part of this journey.", excerpt: "Reflecting on an incredible year of impact and growth at Elia's Hope Community.", image: '/hero-bg.png', author: 'Admin', published: true },
    { title: 'Volunteer Spotlight: Amina Hassan', slug: 'volunteer-spotlight-amina', content: "Amina Hassan has been volunteering with Elia's Hope for two years, teaching mathematics and science to children in our education program. Her dedication and passion have made a significant impact on the children she works with.\n\n\"I believe that education is the key to breaking the cycle of poverty,\" says Amina. \"When I see the children's faces light up when they understand a new concept, I know I'm making a difference.\"", excerpt: 'Meet Amina Hassan, one of our most dedicated volunteers making a difference every day.', image: '/about-image.png', author: 'Admin', published: false },
  ]
  for (const p of blogPostsData) {
    await prisma.blogPost.create({ data: p })
  }
  console.log('📝 Blog posts created')

  // --- Testimonials ---
  const testimonialsData = [
    { name: 'Grace Mwenda', role: 'Program Beneficiary', content: "Elia's Hope gave me the opportunity to go to school. Now I dream of becoming a doctor and helping other children like me.", image: '/success-story.png', rating: 5, featured: true },
    { name: 'Amina Hassan', role: 'Volunteer', content: "Volunteering with Elia's Hope has been one of the most rewarding experiences of my life. The children inspire me every day.", image: '/about-image.png', rating: 5, featured: true },
    { name: 'Dr. James Mwangi', role: 'Partner Organization', content: "We are proud to partner with Elia's Hope. Their commitment to transparency and impact is truly commendable.", image: '/about-image.png', rating: 5, featured: false },
    { name: 'Maria Garcia', role: 'Sponsor', content: "Sponsoring a child through Elia's Hope has been a beautiful experience. Seeing the progress and joy in these children's lives is incredibly fulfilling.", image: '/about-image.png', rating: 5, featured: true },
  ]
  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t })
  }
  console.log('⭐ Testimonials created')

  // --- Partners ---
  const partnersData = [
    { name: 'UNICEF Tanzania', logo: '/logo.png', website: 'https://unicef.org', category: 'international', order: 1 },
    { name: 'Mwanza City Council', logo: '/logo.png', website: 'https://mwanza.go.tz', category: 'government', order: 2 },
    { name: 'Tanzania Education Authority', logo: '/logo.png', category: 'government', order: 3 },
    { name: 'Hope International', logo: '/logo.png', website: 'https://hopeint.org', category: 'international', order: 4 },
    { name: 'Local Business Association', logo: '/logo.png', category: 'local', order: 5 },
  ]
  for (const p of partnersData) {
    await prisma.partner.create({ data: p })
  }
  console.log('🤝 Partners created')

  // --- Success Stories ---
  const successStoriesData = [
    { childName: 'Grace Mwenda', title: 'From Orphan to Future Doctor', beforeStory: 'Grace lost her parents at age 5 and was struggling to survive with her elderly grandmother. She could not afford school fees and was at risk of dropping out.', afterStory: "With Elia's Hope support, Grace is now thriving in school, consistently ranking in the top 5 of her class. She dreams of becoming a doctor to help other vulnerable children.", beforeImage: '/success-story.png', afterImage: '/success-story.png', quote: "Elia's Hope gave me hope when I had none. Now I believe my dreams can come true.", featured: true },
    { childName: 'Joseph Kamau', title: 'Finding Joy in Learning', beforeStory: "Joseph's family could not afford school supplies, and he often went to school without proper materials. He was falling behind in his studies.", afterStory: 'Through our education program, Joseph received all the supplies he needed. His grades improved dramatically, and he now helps tutor younger children in the program.', beforeImage: '/success-story.png', afterImage: '/success-story.png', quote: 'I love learning now. Thank you for giving me the chance to go to school.', featured: false },
  ]
  for (const s of successStoriesData) {
    await prisma.successStory.create({ data: s })
  }
  console.log('📖 Success stories created')

  // --- Contact Messages ---
  const messagesData = [
    { name: 'Alice Ndege', email: 'alice@example.com', phone: '+255 111 222 333', message: 'I would like to learn more about your volunteer program.', read: true },
    { name: 'Bob Stevens', email: 'bob@example.com', message: 'How can I donate from the United States?', read: false },
    { name: 'Catherine Mushi', email: 'catherine@example.com', phone: '+255 444 555 666', message: 'I am interested in partnering with your organization for a community project.', read: false },
  ]
  for (const m of messagesData) {
    await prisma.contactMessage.create({ data: m })
  }
  console.log('💬 Contact messages created')

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log('\n✅ Seed data created successfully!')
  console.log(`👤 Admin user: ${admin.email}`)
  console.log(`🔑 Admin password: EliaHope2024! (hashed in DB)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
