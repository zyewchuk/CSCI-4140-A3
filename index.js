const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb+srv://zk977238:kvK8COmFyE4xb0su@cluster0.7cfbvrw.mongodb.net/';
const dbName = 'assignment3';
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (like JS) from the 'public' directory
app.use(express.static('public'));
app.use(bodyParser.json());

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

// Serve index.html as the main entry point
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/players', async (req, res) => {
  await connectToDB();

  const database = client.db(dbName);
  const playersCollection = database.collection('Players545');

  try {
    // Retrieve players data
    const players = await playersCollection.find({}).toArray();

    // Send JSON response for API request
    if (req.accepts('json')) {
      res.json(players);
    } else {
      // Render the player list view for HTML request
      res.render('playerList', { players });
    }
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Add a route for teams
app.get('/teams', async (req, res) => {
  await connectToDB();

  const database = client.db(dbName);
  const teamsCollection = database.collection('Teams545');

  try {
    // Retrieve teams data
    const teams = await teamsCollection.find({}).toArray();

    // Send JSON response for API request
    if (req.accepts('json')) {
      res.json(teams);
    } else {
      // Render the teams view for HTML request
      res.render('teams', { teams });
    }
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Add a new endpoint to handle the insertion of players into the "players" array of a specific team
app.post('/insert-players/:teamName', async (req, res) => {
  try {
    await connectToDB();

    const database = client.db(dbName);
    const teamsCollection = database.collection('Teams545');

    const teamName = req.params.teamName;
    const players = req.body.players; 
   
    // Update the specified team with the new player
    await teamsCollection.updateOne(
      { "team_name545": teamName },
      { $push: { players: { $each: players.map(player => player.playerName) } } }
      
    );
    
    console.log(`Players added to the players array of ${teamName}`);
    res.json({ success: true, message: 'Players added successfully' });
  } catch (err) {
    console.error('Error adding players to the team:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at ${baseUrl}`);
});
