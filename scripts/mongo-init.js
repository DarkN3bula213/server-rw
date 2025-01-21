const initReplica = () => {
  try {
    const status = rs.status();
    if (status.ok) {
      print('Replica set already initialized');
      return;
    }
  } catch (err) {
    print('Initializing replica set...');
    rs.initiate({
      _id: 'rs0',
      members: [
        { _id: 0, host: 'mongo1:27017', priority: 2 },
        { _id: 1, host: 'mongo2:27017', priority: 1 },
        { _id: 2, host: 'mongo3:27017', priority: 1 },
      ],
    });
  }
};

initReplica();
