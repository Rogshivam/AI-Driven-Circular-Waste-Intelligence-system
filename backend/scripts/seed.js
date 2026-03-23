require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const WasteCollection = require('../models/WasteCollection');
const Complaint = require('../models/Complaint');
const Route = require('../models/Route');
const RewardTransaction = require('../models/RewardTransaction');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WasteCollection.deleteMany({});
    await Complaint.deleteMany({});
    await Route.deleteMany({});
    await RewardTransaction.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const collectorPassword = await bcrypt.hash('collector123', 10);
    const citizenPassword = await bcrypt.hash('citizen123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@wastewise.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890'
      },
      rewardPoints: 0,
      level: 1
    });

    const citizen = await User.create({
      username: 'citizen1',
      email: 'citizen@wastewise.com',
      password: citizenPassword,
      role: 'citizen',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567891',
        address: 'Green Park, Delhi'
      },
      rewardPoints: 2550,
      level: 3,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      }
    });

    const collector = await User.create({
      username: 'collector1',
      email: 'collector@wastewise.com',
      password: collectorPassword,
      role: 'collector',
      profile: {
        firstName: 'Mike',
        lastName: 'Wilson',
        phone: '+1234567892'
      },
      rewardPoints: 435,
      level: 2,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    });

    console.log('Created users');

    // Create routes
    const route = await Route.create({
      routeCode: 'G-0923',
      name: 'Sector 11 Route',
      areas: [
        {
          name: 'Sector 11',
          coordinates: [77.2090, 28.6139],
          estimatedTime: 30,
          priority: 'high'
        },
        {
          name: 'Sector 12',
          coordinates: [77.2190, 28.6239],
          estimatedTime: 45,
          priority: 'medium'
        }
      ],
      collectorId: collector._id,
      status: 'assigned',
      scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      scheduledEnd: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      totalDistance: 15.5,
      estimatedDuration: 180,
      aiOptimized: true
    });

    console.log('Created routes');

    // Create waste collections
    await WasteCollection.create([
      {
        collectorId: collector._id,
        area: 'Sector 11',
        route: 'G-0923',
        status: 'completed',
        wasteTypes: [
          { type: 'dry', amount: 50 },
          { type: 'wet', amount: 30 }
        ],
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        completedAt: new Date(Date.now() - 19 * 60 * 1000), // 19 mins ago
        rewardPoints: 20
      },
      {
        collectorId: collector._id,
        area: 'Park Street 2',
        route: 'G-0923',
        status: 'in_progress',
        wasteTypes: [
          { type: 'dry', amount: 40 },
          { type: 'hazardous', amount: 5 }
        ],
        location: {
          type: 'Point',
          coordinates: [77.2190, 28.6239]
        },
        rewardPoints: 25
      },
      {
        collectorId: collector._id,
        area: 'Market Area 1',
        route: 'G-0923',
        status: 'pending',
        wasteTypes: [
          { type: 'wet', amount: 60 }
        ],
        location: {
          type: 'Point',
          coordinates: [77.2290, 28.6339]
        },
        rewardPoints: 15
      }
    ]);

    console.log('Created waste collections');

    // Create complaints
    await Complaint.create([
      {
        citizenId: citizen._id,
        sector: 'Sector 11',
        description: 'Garbage not collected from the main road',
        status: 'resolved',
        priority: 'medium',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        resolvedAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
      },
      {
        citizenId: citizen._id,
        sector: 'Green Park',
        description: 'Overflowing garbage bin near the park entrance',
        status: 'in_progress',
        priority: 'high',
        location: {
          type: 'Point',
          coordinates: [77.2190, 28.6239]
        },
        assignedTo: collector._id
      },
      {
        citizenId: citizen._id,
        sector: 'Lajpat Nagar',
        description: 'Illegal dumping on the roadside',
        status: 'pending',
        priority: 'low',
        location: {
          type: 'Point',
          coordinates: [77.2390, 28.6439]
        }
      },
      {
        citizenId: citizen._id,
        sector: 'Mayur Vihar',
        description: 'Waste accumulation near residential complex',
        status: 'resolved',
        priority: 'medium',
        location: {
          type: 'Point',
          coordinates: [77.2490, 28.6539]
        },
        resolvedAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      }
    ]);

    console.log('Created complaints');

    // Create reward transactions
    await RewardTransaction.create([
      {
        userId: citizen._id,
        type: 'earned',
        amount: 150,
        description: 'Weekly Report',
        category: 'weekly_report'
      },
      {
        userId: citizen._id,
        type: 'earned',
        amount: 20,
        description: 'Daily Pickup',
        category: 'daily_pickup'
      },
      {
        userId: citizen._id,
        type: 'earned',
        amount: 15,
        description: 'Proper Disposal',
        category: 'proper_disposal'
      },
      {
        userId: collector._id,
        type: 'earned',
        amount: 20,
        description: 'Waste Collection',
        category: 'daily_pickup',
        referenceId: (await WasteCollection.findOne())._id,
        referenceModel: 'WasteCollection'
      }
    ]);

    console.log('Created reward transactions');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@wastewise.com / admin123');
    console.log('Citizen: citizen@wastewise.com / citizen123');
    console.log('Collector: collector@wastewise.com / collector123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seed function
seedData();
