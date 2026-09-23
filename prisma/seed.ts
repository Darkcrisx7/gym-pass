// Seeds a demo gym so the product can be explored immediately.
// Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function token() {
  return randomBytes(24).toString("base64url");
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const existing = await prisma.gym.findFirst({ where: { isDemo: true } });
  if (existing) {
    console.log("Demo gym already exists — skipping seed.");
    return;
  }

  const gym = await prisma.gym.create({
    data: {
      name: "Powerfit Gym",
      address: "12 MG Road, Bengaluru",
      contactNumber: "+91 98765 43210",
      primaryColor: "#D8A945",
      secondaryColor: "#0F1A16",
      isDemo: true,
    },
  });

  await prisma.user.create({
    data: {
      gymId: gym.id,
      name: "Demo Owner",
      email: "demo@gympass.app",
      mobile: "+91 98765 43210",
      passwordHash: await bcrypt.hash("demo1234", 12),
      role: "OWNER",
    },
  });

  await prisma.user.create({
    data: {
      gymId: gym.id,
      name: "Front Desk",
      email: "staff@gympass.app",
      mobile: "+91 90000 00000",
      passwordHash: await bcrypt.hash("demo1234", 12),
      role: "STAFF",
    },
  });

  const members: Array<{
    memberCode: string;
    fullName: string;
    mobile: string;
    plan: string;
    startOffsetDays: number;
    expiryOffsetDays: number;
    amount: number;
    renewals?: number;
  }> = [
    { memberCode: "PF-0001", fullName: "Rahul Kumar", mobile: "+91 98765 00001", plan: "3 Month Membership", startOffsetDays: -10, expiryOffsetDays: 80, amount: 1999, renewals: 2 },
    { memberCode: "PF-0002", fullName: "Ananya Rao", mobile: "+91 98765 00002", plan: "12 Month Membership", startOffsetDays: -200, expiryOffsetDays: 165, amount: 8999 },
    { memberCode: "PF-0003", fullName: "Vikram Singh", mobile: "+91 98765 00003", plan: "1 Month Membership", startOffsetDays: -25, expiryOffsetDays: 5, amount: 899 },
    { memberCode: "PF-0004", fullName: "Sneha Patil", mobile: "+91 98765 00004", plan: "6 Month Membership", startOffsetDays: -160, expiryOffsetDays: 3, amount: 3499 },
    { memberCode: "PF-0005", fullName: "Arjun Mehta", mobile: "+91 98765 00005", plan: "3 Month Membership", startOffsetDays: -100, expiryOffsetDays: -10, amount: 1999 },
    { memberCode: "PF-0006", fullName: "Divya Iyer", mobile: "+91 98765 00006", plan: "1 Month Membership", startOffsetDays: -60, expiryOffsetDays: -28, amount: 899 },
    { memberCode: "PF-0007", fullName: "Karan Malhotra", mobile: "+91 98765 00007", plan: "6 Month Membership", startOffsetDays: -30, expiryOffsetDays: 150, amount: 3499 },
  ];

  for (const m of members) {
    const startDate = daysFromNow(m.startOffsetDays);
    const expiryDate = daysFromNow(m.expiryOffsetDays);
    const member = await prisma.member.create({
      data: {
        gymId: gym.id,
        memberCode: m.memberCode,
        cardToken: token(),
        fullName: m.fullName,
        mobile: m.mobile,
        plan: m.plan,
        startDate,
        expiryDate,
        amountPaid: m.amount,
        paymentStatus: "PAID",
        renewals: {
          create: {
            gymId: gym.id,
            plan: m.plan,
            durationLabel: m.plan.replace(" Membership", ""),
            startDate,
            endDate: expiryDate,
            amount: m.amount,
            paymentStatus: "PAID",
          },
        },
      },
    });

    // Give Rahul a couple of older renewal-history rows so the history view
    // has something to show on the flagship demo member.
    if (m.renewals) {
      for (let i = 1; i <= m.renewals; i++) {
        const end = daysFromNow(m.startOffsetDays - (i - 1) * 90);
        const start = daysFromNow(m.startOffsetDays - i * 90);
        await prisma.membershipRenewal.create({
          data: {
            gymId: gym.id,
            memberId: member.id,
            plan: m.plan,
            durationLabel: "3 Months",
            startDate: start,
            endDate: end,
            amount: m.amount,
            paymentStatus: "PAID",
          },
        });
      }
    }
  }

  // One deliberately inactive/deactivated member to demonstrate that state.
  await prisma.member.create({
    data: {
      gymId: gym.id,
      memberCode: "PF-0008",
      cardToken: token(),
      fullName: "Old Member (Deactivated)",
      mobile: "+91 98765 00008",
      plan: "1 Month Membership",
      startDate: daysFromNow(-400),
      expiryDate: daysFromNow(-370),
      amountPaid: 899,
      paymentStatus: "PAID",
      isActive: false,
    },
  });

  console.log(`Seeded demo gym "${gym.name}" with ${members.length + 1} members.`);
  console.log("Log in with demo@gympass.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
