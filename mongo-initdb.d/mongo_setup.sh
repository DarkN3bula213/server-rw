# #!/bin/bash
# echo "sleeping for 10 seconds"
# sleep 10

# echo mongo_setup.sh time now: `date +"%T" `
# mongosh --host database:27017 <<EOF
#   var cfg = {
#     "_id": "rs0",
#     "version": 1,
#     "members": [
#       {
#         "_id": 0,
#         "host": "database:27017",
#         "priority": 1
#       }
#     ]
#   };
#   rs.initiate(cfg);

  
# EOF
#!/bin/bash
echo "sleeping for 10 seconds"
sleep 10

echo mongo_setup.sh time now: `date +"%T" `
# First connect without authentication to create the admin user
mongosh --host database:27017 <<EOF
  // Initialize replica set first
  try {
    rs.status();
  } catch(err) {
    var cfg = {
      "_id": "rs0",
      "version": 1,
      "members": [
        {
          "_id": 0,
          "host": "database:27017",
          "priority": 1
        }
      ]
    };
    rs.initiate(cfg);
    print("Replica set initialized");
  }

  // Wait for replica set to be ready
  while (!rs.isMaster().ismaster) {
    sleep(1000);
    print("Waiting for replica set primary...");
  }
  print("Replica set is ready");

  // Create admin user
  db = db.getSiblingDB('admin');
  try {
    db.createUser({
      user: "admin",
      pwd: "admin",
      roles: [
        { role: "root", db: "admin" },
        { role: "userAdminAnyDatabase", db: "admin" },
        { role: "dbAdminAnyDatabase", db: "admin" },
        { role: "readWriteAnyDatabase", db: "admin" }
      ]
    });
    print("Admin user created successfully");
  } catch(err) {
    print("Admin user creation error:", err.message);
  }
EOF

echo "MongoDB setup completed"