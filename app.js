const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://loaclhost:3000/')
    })
  } catch (e) {
    console.log(`Db Error: ${e.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

// converting DB to response

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// API 1
app.get('/players/', async (request, response) => {
  const playerQuery = `
    SELECT * FROM cricket_team;`
  const playersArray = await db.all(playerQuery)
  response.send(
    playersArray.map(everyPlayer =>
      convertDbObjectToResponseObject(everyPlayer),
    ),
  )
  console.log('Success')
})

// API 2
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postplayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role) 
  VALUES
    ('${playerName}',${jerseyNumber},'${role}'); `
  const player = await db.run(postplayerQuery)
  response.send('Player Added to Team')
})

// API 3 

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
      SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// API 4 

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params 
  const {playerName,jerseyNumber,role} = request.body
  const UpdatedplayerQuery = `
  UPDATE 
      cricket_team 
    SET 
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE 
      player_id = ${playerId};`;
  await db.run(UpdatedplayerQuery);
  response.send("Player Details Updated");
})

// API 5 

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
      DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const deleteQuery = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;