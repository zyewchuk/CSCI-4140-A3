// playerList.js
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('http://localhost:3000/players');
    const players = await response.json();
  
    const playerList = document.getElementById('playerList');
  
    players.forEach(player => {
      const listItem = document.createElement('li');
      
      listItem.innerHTML = `
        <h2>${player.first_name} ${player.last_name_545}</h2>
        <p>${player.phone_number}</p>
        <p>Preferences:</p>
        ${player.preferences.map((preference, index) => `<p>${index + 1}st: ${preference}</p>`).join('')}
      `;
  
      playerList.appendChild(listItem);
    });
  });
  