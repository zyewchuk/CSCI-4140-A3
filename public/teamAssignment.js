document.addEventListener('DOMContentLoaded', async () => {
  // Fetch players data from the server
  const baseUrl = window.location.origin;
  const playersResponse = await fetch(`${baseUrl}/players`);
  const players = await playersResponse.json();

  // Fetch teams data from the server
  const teamsResponse = await fetch(`${baseUrl}/teams`);
  const teams = await teamsResponse.json();


  console.log('Players:', players);
  console.log('Teams:', teams);

  // Event listener for the assignButton click
  document.getElementById('assignButton').addEventListener('click', async () => {
    try {
      // Call the function to perform the assignment
      const assignedPlayers = assignPlayersToTeams(players, teams);

      // Insert assigned players into the database for each team
      for (const team of teams) {
        await insertAssignedPlayersIntoDB(
          assignedPlayers.filter(player => player.team === team.team_name545),
          team.team_name545
        );
      }
        // Display the results
      displayAssignedPlayers(assignedPlayers);
      await displayTeams();
      // Display the results or perform any additional actions
    } catch (err) {
      console.error('Error performing assignment:', err);
    }
  });



  // Function to display assigned players' information
  function displayAssignedPlayers(assignedPlayers) {
    const container = document.getElementById('assignedPlayersContainer');
    
    // Clear previous content
    container.innerHTML = '';

    assignedPlayers.forEach(player => {
        const playerInfoDiv = document.createElement('div');
        playerInfoDiv.textContent = `${player.first_name} ${player.last_name_545} assigned to ${player.team} - ${player.points} points`;
        container.appendChild(playerInfoDiv);
    });
}
 
// Function to assign players to teams based on preferences
  function assignPlayersToTeams(players, teams) {
    // Reset players in each team
    teams.forEach((team) => {
      team.players = [];
    });

    // Sort players by the number of preferences
    players.sort((a, b) => a.preferences.length - b.preferences.length);

    const assignedPlayers = []; // Capture assigned players here

    // Assign players to teams based on preferences
    players.forEach((player) => {
      let assignedTeam = null; // Initialize assignedTeam outside the loop

      for (const preference of player.preferences.slice(0, 2)) {
        assignedTeam = teams.find(
          (team) => team.team_name545 === preference && team.players.length < 3
        );

        if (assignedTeam) {
          // Assign points based on preferences
          const points = player.preferences.indexOf(preference) === 0 ? 2 : 1;

          assignedTeam.players.push(player);
          
          // Capture assigned player
          assignedPlayers.push({
            first_name: player.first_name,
            last_name_545: player.last_name_545,
            team: assignedTeam.team_name545,
            points: points,
          });

          console.log(
            `${player.first_name} ${player.last_name_545} assigned to ${assignedTeam.team_name545} - ${points} points`
          );

          break; // Break the loop after successful assignment
        }
      }

      // Check if assignedTeam is still null after the loop
      if (!assignedTeam) {
        console.log(
          `${player.first_name} ${player.last_name_545} cannot be assigned to any team.`
        );
      }
    });


let totalPointsAcrossTeams = 0; // Initialize total points

teams.forEach((team) => {
  const totalPoints = team.players.reduce((sum, player) => {
    // Assign points based on preferences
    const points =
      player.preferences.indexOf(team.team_name545) === 0 ? 2 : 1;
    return sum + points;
  }, 0);

  console.log(`${team.team_name545} - Total Points: ${totalPoints}`);
  totalPointsAcrossTeams += totalPoints; // Accumulate total points
});

console.log(`Total Points Across Teams: ${totalPointsAcrossTeams}`);

return assignedPlayers;

  }

  // Function to insert assigned players into MongoDB
  async function insertAssignedPlayersIntoDB(assignedPlayers, teamName) {
      try {
        const response = await fetch(
          `${baseUrl}/insert-players/${teamName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              players: assignedPlayers.map(player => ({
                playerName: `${player.first_name} ${player.last_name_545}`,
              })),
            }),
          }
        );
  
        const result = await response.json();
        console.log(result);
      } catch (err) {
        console.error('Error inserting assigned players into DB:', err);
      }
    }

// Function to fetch and display teams data
async function displayTeams() {
  try {
    // Fetch teams data from the server
    const teamsResponse = await fetch(`${baseUrl}/teams`);
    if (!teamsResponse.ok) {
      throw new Error('Failed to fetch teams');
    }

    const teams = await teamsResponse.json();

    // Get the container where we want to display teams
    const teamsContainer = document.getElementById('teamsList');

    // Clear the container before appending teams
    teamsContainer.innerHTML = '';

    // Iterate through each team and append its information to the container
    teams.forEach(team => {
      const teamDiv = document.createElement('div');
      teamDiv.innerHTML = `
        <h2>${team.team_name545}</h2>
        <p>Manager: ${team.manager_first_name} ${team.manager_last_name}</p>
        <p>Players:</p>
        <ul>
          ${team.players.map(player => `<li>${player}</li>`).join('')}
        </ul>
      `;
      teamsContainer.appendChild(teamDiv);
    });
  } catch (error) {
    console.error('Error fetching and displaying teams:', error);
  }
}

});
