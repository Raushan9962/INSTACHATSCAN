const seedUsers = async () => {
  try {
    await User.deleteMany({});

    const users = [
      {
        name: 'Admin User',
        email: 'admin@shop.com',
        password: 'Admin123!',
        role: 'ADMIN',
        addresses: [ /* ... */ ]
      },
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'Customer123!',
        role: 'CUSTOMER',
        addresses: [ /* ... */ ]
      }
    ];

    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      const user = new User({
        ...userData,
        passwordHash, // store hashed password
      });

      await user.save();
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};
