import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.contactMessage.deleteMany()
  await prisma.sponsor.deleteMany()
  await prisma.child.deleteMany()
  await prisma.volunteer.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.event.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.successStory.deleteMany()
  await prisma.program.deleteMany()
  await prisma.stat.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.user.deleteMany()

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@eliashope.org',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin',
    },
  })

  // Site settings
  const settings = [
    { key: 'hero_title', value: 'Building Hope, Transforming Lives' },
    { key: 'hero_subtitle', value: 'Elia\'s Hope Community is dedicated to empowering children and families in Mwanza, Tanzania through education, healthcare, and community development.' },
    { key: 'about_title', value: 'About Elia\'s Hope Community' },
    { key: 'about_content', value: 'Founded with a vision to transform the lives of vulnerable children, Elia\'s Hope Community has been a beacon of hope in Mwanza, Tanzania. We believe every child deserves access to quality education, healthcare, and a safe environment to grow.' },
    { key: 'mission', value: 'To empower vulnerable children and communities through sustainable programs in education, healthcare, and spiritual development, creating lasting change in Mwanza, Tanzania.' },
    { key: 'vision', value: 'A world where every child has the opportunity to thrive, regardless of their background or circumstances.' },
    { key: 'core_values', value: 'Compassion,Integrity,Empowerment,Community,Faith,Sustainability' },
    { key: 'contact_email', value: 'info@eliashope.org' },
    { key: 'contact_phone', value: '+255 123 456 789' },
    { key: 'contact_address', value: 'Mwanza, Tanzania' },
    { key: 'footer_text', value: '© 2024 Elia\'s Hope Community. All rights reserved.' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.create({ data: s })
  }

  // Programs
  const programs = [
    { title: 'Education Program', slug: 'education', description: 'Providing quality education and school supplies to children in need, ensuring they have the tools to build a brighter future.', icon: 'book-open', image: '/program-education.png', order: 1, active: true },
    { title: 'Healthcare Program', slug: 'healthcare', description: 'Ensuring access to basic healthcare services, vaccinations, and nutrition support for vulnerable children and families.', icon: 'heart', image: '/program-childcare.png', order: 2, active: true },
    { title: 'Feeding Program', slug: 'feeding', description: 'Providing nutritious meals to children in our programs, fighting malnutrition and ensuring healthy development.', icon: 'utensils', image: '/program-feeding.png', order: 3, active: true },
    { title: 'Bible Study', slug: 'bible-study', description: 'Nurturing spiritual growth through Bible study sessions and mentorship programs for children and youth.', icon: 'book', image: '/program-bible.png', order: 4, active: true },
    { title: 'Community Outreach', slug: 'community-outreach', description: 'Engaging with local communities through workshops, training sessions, and collaborative development projects.', icon: 'users', image: '/program-community.png', order: 5, active: true },
  ]
  for (const p of programs) {
    await prisma.program.create({ data: p })
  }

  // Stats
  const stats = [
    { label: 'Children Supported', value: 500, icon: 'baby', order: 1 },
    { label: 'Volunteers', value: 120, icon: 'users', order: 2 },
    { label: 'Communities Reached', value: 15, icon: 'home', order: 3 },
    { label: 'Meals Provided', value: 25000, icon: 'utensils', order: 4 },
  ]
  for (const s of stats) {
    await prisma.stat.create({ data: s })
  }

  // Campaigns
  const campaigns = [
    { title: 'School Supplies Drive', description: 'Help us provide school supplies for 200 children this upcoming school year.', goal: 5000000, raised: 3500000, image: '/program-education.png', status: 'active' },
    { title: 'Healthcare Fund', description: 'Support our healthcare program to provide medical care for children in need.', goal: 10000000, raised: 7200000, image: '/program-childcare.png', status: 'active' },
    { title: 'Feeding Program Expansion', description: 'Help us expand our feeding program to reach 100 more children.', goal: 8000000, raised: 5500000, image: '/program-feeding.png', status: 'active' },
    { title: 'Christmas Gift Drive', description: 'Bring joy to children this Christmas with gifts and celebration.', goal: 3000000, raised: 3000000, image: '/program-community.png', status: 'completed' },
  ]
  for (const c of campaigns) {
    await prisma.campaign.create({ data: c })
  }

  // Events
  const events = [
    { title: 'Annual Charity Gala', description: 'Join us for our annual charity gala to raise funds for children\'s education programs.', date: new Date('2025-03-15'), location: 'Mwanza Conference Center', image: '/event-sample.png', status: 'upcoming' },
    { title: 'Community Health Fair', description: 'Free health screenings and wellness workshops for the community.', date: new Date('2025-02-20'), location: 'Nyamagana Community Hall', image: '/event-sample.png', status: 'upcoming' },
    { title: 'Youth Leadership Workshop', description: 'Empowering young people with leadership skills and mentorship.', date: new Date('2025-01-10'), location: 'Elia\'s Hope Center', image: '/event-sample.png', status: 'completed' },
    { title: 'Christmas Celebration', description: 'Annual Christmas celebration with gifts, food, and activities for children.', date: new Date('2024-12-25'), location: 'Elia\'s Hope Center', image: '/event-sample.png', status: 'completed' },
    { title: 'Back to School Drive', description: 'Distribution of school supplies and uniforms for the new school year.', date: new Date('2025-01-15'), location: 'Mwanza Primary School', image: '/event-sample.png', status: 'completed' },
  ]
  for (const e of events) {
    await prisma.event.create({ data: e })
  }

  // Gallery images
  const galleryImages = [
    { url: '/program-education.png', title: 'Education Program', category: 'programs', description: 'Children learning in our education program' },
    { url: '/program-childcare.png', title: 'Childcare Support', category: 'programs', description: 'Providing care and support for children' },
    { url: '/program-feeding.png', title: 'Feeding Program', category: 'programs', description: 'Nutritious meals for children' },
    { url: '/program-bible.png', title: 'Bible Study', category: 'programs', description: 'Spiritual growth and mentorship' },
    { url: '/program-community.png', title: 'Community Outreach', category: 'community', description: 'Community engagement activities' },
    { url: '/event-sample.png', title: 'Community Event', category: 'events', description: 'Community gathering and celebration' },
    { url: '/success-story.png', title: 'Success Story', category: 'stories', description: 'A child\'s transformation story' },
    { url: '/hero-bg.png', title: 'Our Community', category: 'community', description: 'The community we serve' },
    { url: '/about-image.png', title: 'Our Team', category: 'community', description: 'Dedicated team members' },
  ]
  for (const g of galleryImages) {
    await prisma.galleryImage.create({ data: g })
  }

  // Donations
  const donations = [
    { donorName: 'John Mwangi', donorEmail: 'john@example.com', amount: 500000, currency: 'TZS', method: 'mobile', type: 'one-time', campaign: 'School Supplies Drive', status: 'confirmed', message: 'Keep up the great work!' },
    { donorName: 'Sarah Johnson', donorEmail: 'sarah@example.com', amount: 1000000, currency: 'TZS', method: 'card', type: 'one-time', campaign: 'Healthcare Fund', status: 'confirmed', message: 'Happy to support!' },
    { donorName: 'David Kimaro', donorEmail: 'david@example.com', amount: 200000, currency: 'TZS', method: 'mobile', type: 'monthly', campaign: 'Feeding Program Expansion', status: 'confirmed' },
    { donorName: 'Emily Chen', donorEmail: 'emily@example.com', amount: 750000, currency: 'TZS', method: 'bank', type: 'one-time', campaign: 'School Supplies Drive', status: 'pending' },
    { donorName: 'Michael Brown', donorEmail: 'michael@example.com', amount: 300000, currency: 'TZS', method: 'card', type: 'monthly', campaign: 'Healthcare Fund', status: 'confirmed' },
    { donorName: 'Anna Mbeki', donorEmail: 'anna@example.com', amount: 150000, currency: 'TZS', method: 'mobile', type: 'one-time', campaign: 'Christmas Gift Drive', status: 'confirmed' },
    { donorName: 'Robert Wilson', donorEmail: 'robert@example.com', amount: 2000000, currency: 'TZS', method: 'bank', type: 'one-time', campaign: 'Healthcare Fund', status: 'failed' },
    { donorName: 'Grace Joseph', donorEmail: 'grace@example.com', amount: 400000, currency: 'TZS', method: 'mobile', type: 'monthly', campaign: 'Feeding Program Expansion', status: 'confirmed' },
    { donorName: 'Peter Andrew', donorEmail: 'peter@example.com', amount: 600000, currency: 'TZS', method: 'card', type: 'one-time', campaign: 'School Supplies Drive', status: 'pending' },
    { donorName: 'Lucia Thomas', donorEmail: 'lucia@example.com', amount: 250000, currency: 'TZS', method: 'mobile', type: 'one-time', status: 'confirmed' },
  ]
  for (const d of donations) {
    await prisma.donation.create({ data: d })
  }

  // Volunteers
  const volunteers = [
    { name: 'Amina Hassan', email: 'amina@example.com', phone: '+255 234 567 890', skills: 'Teaching,First Aid', motivation: 'I want to give back to my community and help children succeed.', status: 'approved', programId: 'education' },
    { name: 'James Smith', email: 'james@example.com', phone: '+1 234 567 8901', skills: 'Healthcare,Administration', motivation: 'I believe every child deserves access to healthcare.', status: 'approved' },
    { name: 'Fatima Said', email: 'fatima@example.com', phone: '+255 345 678 901', skills: 'Counseling,Mentoring', motivation: 'I want to support children emotionally and spiritually.', status: 'pending' },
    { name: 'Mark Johnson', email: 'mark@example.com', skills: 'Construction,Carpentry', motivation: 'I want to help build better facilities for the children.', status: 'pending' },
    { name: 'Zainab Omari', email: 'zainab@example.com', phone: '+255 456 789 012', skills: 'Cooking,Nutrition', motivation: 'I want to help provide nutritious meals for children.', status: 'approved' },
    { name: 'Thomas Malley', email: 'thomas@example.com', skills: 'IT,Photography', motivation: 'I want to use my skills to tell the stories of these children.', status: 'rejected' },
  ]
  for (const v of volunteers) {
    await prisma.volunteer.create({ data: v })
  }

  // Children
  const children = [
    { name: 'Grace Mwenda', age: 8, gender: 'female', story: 'Grace lost her parents at a young age and was taken in by her grandmother. She dreams of becoming a doctor one day.', photo: '/success-story.png', status: 'sponsored', program: 'Education Program' },
    { name: 'Joseph Kamau', age: 10, gender: 'male', story: 'Joseph comes from a very poor family. He loves playing football and wants to be a teacher.', photo: '/success-story.png', status: 'available', program: 'Education Program' },
    { name: 'Neema Emmanuel', age: 6, gender: 'female', story: 'Neema is the youngest of five siblings. She loves singing and drawing.', photo: '/success-story.png', status: 'sponsored', program: 'Healthcare Program' },
    { name: 'Baraka Peter', age: 12, gender: 'male', story: 'Baraka walks 5km to school every day. He is a bright student who excels in mathematics.', photo: '/success-story.png', status: 'available', program: 'Feeding Program' },
    { name: 'Asha Mohamed', age: 9, gender: 'female', story: 'Asha\'s family struggles to afford basic needs. She enjoys reading and wants to be a nurse.', photo: '/success-story.png', status: 'available', program: 'Education Program' },
    { name: 'David Lucas', age: 7, gender: 'male', story: 'David has a hearing impairment but doesn\'t let that stop him. He loves painting.', photo: '/success-story.png', status: 'sponsored', program: 'Healthcare Program' },
  ]
  const childRecords: { id: string; name: string; createdAt: Date; updatedAt: Date; program: string | null; status: string; age: number | null; gender: string | null; story: string | null; photo: string | null; }[] = []
  for (const c of children) {
    const child = await prisma.child.create({ data: c })
    childRecords.push(child)
  }

  // Sponsors
  const sponsors = [
    { name: 'Maria Garcia', email: 'maria@example.com', phone: '+1 555 123 4567', childId: childRecords[0].id, amount: 150000, frequency: 'monthly', status: 'active', startDate: new Date('2024-01-15') },
    { name: 'Robert Chen', email: 'robert.c@example.com', phone: '+86 555 987 6543', childId: childRecords[2].id, amount: 200000, frequency: 'monthly', status: 'active', startDate: new Date('2024-03-01') },
    { name: 'Jennifer Williams', email: 'jen.w@example.com', childId: childRecords[5].id, amount: 150000, frequency: 'monthly', status: 'active', startDate: new Date('2024-06-10') },
    { name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+255 789 012 345', amount: 100000, frequency: 'quarterly', status: 'active', startDate: new Date('2024-02-20') },
    { name: 'Lisa Thompson', email: 'lisa@example.com', amount: 300000, frequency: 'annual', status: 'inactive', startDate: new Date('2023-09-01') },
  ]
  for (const s of sponsors) {
    await prisma.sponsor.create({ data: s })
  }

  // Newsletter subscribers
  const subscribers = [
    { name: 'Emma Watson', email: 'emma@example.com', status: 'active' },
    { name: 'James Brown', email: 'james.b@example.com', status: 'active' },
    { name: 'Sophie Laurent', email: 'sophie@example.com', status: 'active' },
    { name: 'Daniel Ochieng', email: 'daniel@example.com', status: 'active' },
    { name: 'Rachel Green', email: 'rachel@example.com', status: 'unsubscribed' },
    { name: 'Carlos Rivera', email: 'carlos@example.com', status: 'active' },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', status: 'active' },
    { name: 'Priya Sharma', email: 'priya@example.com', status: 'active' },
  ]
  for (const sub of subscribers) {
    await prisma.newsletter.create({ data: sub })
  }

  // Blog posts
  const blogPosts = [
    { title: 'Transforming Lives Through Education', slug: 'transforming-lives-education', content: 'Education is the most powerful weapon which you can use to change the world. At Elia\'s Hope Community, we have seen firsthand how access to quality education can transform a child\'s life and, by extension, their entire community.\n\nOur education program currently supports over 500 children across Mwanza, providing them with school supplies, tuition assistance, and mentorship. The results have been remarkable - school attendance has increased by 60% and academic performance has improved significantly.\n\nBut our work is far from done. There are still thousands of children in the region who lack access to basic education. With your support, we can reach more children and give them the opportunity to build a better future.', excerpt: 'How our education program is changing the lives of children in Mwanza, Tanzania.', image: '/program-education.png', author: 'Admin', published: true },
    { title: 'The Power of Community', slug: 'power-of-community', content: 'Community is at the heart of everything we do at Elia\'s Hope. When people come together with a shared purpose, incredible things can happen.\n\nLast month, over 200 community members joined our volunteer program, contributing their time and skills to support our initiatives. From teaching to healthcare, construction to administration, each volunteer brings something unique and valuable.\n\nOur community outreach program has expanded to 15 villages, providing training workshops, health education, and support groups. The impact has been profound - communities are becoming more self-reliant and resilient.', excerpt: 'How community engagement is driving sustainable change in Mwanza.', image: '/program-community.png', author: 'Admin', published: true },
    { title: 'A Year of Impact: 2024 Annual Report', slug: '2024-annual-report', content: 'As we reflect on 2024, we are filled with gratitude for the incredible support from our donors, volunteers, and partners. Together, we have achieved remarkable milestones.\n\nKey achievements include:\n- 500 children supported through our education program\n- 25,000 nutritious meals provided\n- 15 communities reached\n- 120 active volunteers\n- 4 successful fundraising campaigns\n\nThese numbers represent real lives changed and real hope restored. Thank you for being part of this journey.', excerpt: 'Reflecting on an incredible year of impact and growth at Elia\'s Hope Community.', image: '/hero-bg.png', author: 'Admin', published: true },
    { title: 'Volunteer Spotlight: Amina Hassan', slug: 'volunteer-spotlight-amina', content: 'Amina Hassan has been volunteering with Elia\'s Hope for two years, teaching mathematics and science to children in our education program. Her dedication and passion have made a significant impact on the children she works with.\n\n"I believe that education is the key to breaking the cycle of poverty," says Amina. "When I see the children\'s faces light up when they understand a new concept, I know I\'m making a difference."', excerpt: 'Meet Amina Hassan, one of our most dedicated volunteers making a difference every day.', image: '/about-image.png', author: 'Admin', published: false },
  ]
  for (const p of blogPosts) {
    await prisma.blogPost.create({ data: p })
  }

  // Testimonials
  const testimonials = [
    { name: 'Grace Mwenda', role: 'Program Beneficiary', content: 'Elia\'s Hope gave me the opportunity to go to school. Now I dream of becoming a doctor and helping other children like me.', image: '/success-story.png', rating: 5, featured: true },
    { name: 'Amina Hassan', role: 'Volunteer', content: 'Volunteering with Elia\'s Hope has been one of the most rewarding experiences of my life. The children inspire me every day.', image: '/about-image.png', rating: 5, featured: true },
    { name: 'Dr. James Mwangi', role: 'Partner Organization', content: 'We are proud to partner with Elia\'s Hope. Their commitment to transparency and impact is truly commendable.', image: '/about-image.png', rating: 5, featured: false },
    { name: 'Maria Garcia', role: 'Sponsor', content: 'Sponsoring a child through Elia\'s Hope has been a beautiful experience. Seeing the progress and joy in these children\'s lives is incredibly fulfilling.', image: '/about-image.png', rating: 5, featured: true },
  ]
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }

  // Partners
  const partnerList = [
    { name: 'UNICEF Tanzania', logo: '/logo.png', website: 'https://unicef.org', category: 'international', order: 1 },
    { name: 'Mwanza City Council', logo: '/logo.png', website: 'https://mwanza.go.tz', category: 'government', order: 2 },
    { name: 'Tanzania Education Authority', logo: '/logo.png', category: 'government', order: 3 },
    { name: 'Hope International', logo: '/logo.png', website: 'https://hopeint.org', category: 'international', order: 4 },
    { name: 'Local Business Association', logo: '/logo.png', category: 'local', order: 5 },
  ]
  for (const p of partnerList) {
    await prisma.partner.create({ data: p })
  }

  // Success stories
  const successStories = [
    { childName: 'Grace Mwenda', title: 'From Orphan to Future Doctor', beforeStory: 'Grace lost her parents at age 5 and was struggling to survive with her elderly grandmother. She could not afford school fees and was at risk of dropping out.', afterStory: 'With Elia\'s Hope support, Grace is now thriving in school, consistently ranking in the top 5 of her class. She dreams of becoming a doctor to help other vulnerable children.', beforeImage: '/success-story.png', afterImage: '/success-story.png', quote: 'Elia\'s Hope gave me hope when I had none. Now I believe my dreams can come true.', featured: true },
    { childName: 'Joseph Kamau', title: 'Finding Joy in Learning', beforeStory: 'Joseph\'s family could not afford school supplies, and he often went to school without proper materials. He was falling behind in his studies.', afterStory: 'Through our education program, Joseph received all the supplies he needed. His grades improved dramatically, and he now helps tutor younger children in the program.', beforeImage: '/success-story.png', afterImage: '/success-story.png', quote: 'I love learning now. Thank you for giving me the chance to go to school.', featured: false },
  ]
  for (const s of successStories) {
    await prisma.successStory.create({ data: s })
  }

  // Contact messages
  const messages = [
    { name: 'Alice Ndege', email: 'alice@example.com', phone: '+255 111 222 333', message: 'I would like to learn more about your volunteer program.', read: true },
    { name: 'Bob Stevens', email: 'bob@example.com', message: 'How can I donate from the United States?', read: false },
    { name: 'Catherine Mushi', email: 'catherine@example.com', phone: '+255 444 555 666', message: 'I am interested in partnering with your organization for a community project.', read: false },
  ]
  for (const m of messages) {
    await prisma.contactMessage.create({ data: m })
  }

  console.log('Seed data created successfully!')
  console.log(`Admin user: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
