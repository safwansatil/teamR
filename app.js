document.addEventListener('DOMContentLoaded', () => {
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }


    function createTeams(totalTrainers, teamCount, skipList, lockedGroup, lockedTeams, trainerNames) {
        let trainers = Array.from({ length: totalTrainers }, (_, i) => ({
            id: i + 1,
            name: trainerNames[i]
        }));
        trainers = trainers.filter(t => !skipList.includes(t.id));
        let group = trainers.filter(t => lockedGroup.includes(t.id));
        let remainingTrainers = trainers.filter(t => !lockedGroup.includes(t.id));
        const teams = Array.from({ length: teamCount }, () => []);
        // Distribute locked group members among locked teams
        if (group.length && lockedTeams > 0) {
            let groupShuffled = shuffleArray(group);
            for (let i = 0; i < groupShuffled.length; i++) {
                teams[i % lockedTeams].push(groupShuffled[i]);
            }
        }
        // Distribute remaining trnrs
        let allRemaining = shuffleArray(remainingTrainers);
        for (let i = 0; i < allRemaining.length; i++) {
            let minMembers = Infinity;
            let targetTeamIndex = -1;
            for (let j = 0; j < teams.length; j++) {
                if (teams[j].length < minMembers) {
                    minMembers = teams[j].length;
                    targetTeamIndex = j;
                }
            }
            teams[targetTeamIndex].push(allRemaining[i]);
        }
        return teams;
    }

    const generateBtn = document.getElementById('generateBtn');
    const actionBtn = document.getElementById('actionBtn');
    const playerCountInput = document.getElementById('playerCount');
    const roleTypeSelect = document.getElementById('roleType');
    const playersContainer = document.getElementById('playersContainer');
    const assignModeBtn = document.getElementById('assignModeBtn');
    const teamModeBtn = document.getElementById('teamModeBtn');
    const assignControls = document.getElementById('assignControls');
    const teamControls = document.getElementById('teamControls');
    const teamCountInput = document.getElementById('teamCount');
    const teamDisplay = document.getElementById('teamDisplay');
    const teamsContainer = document.getElementById('teamsContainer');
    const skipListInput = document.getElementById('skipList');
    const lockedGroupInput = document.getElementById('lockedGroup');
    const lockedTeamsInput = document.getElementById('lockedTeams');

    let players = [];
    let currentMode = 'assign';

   
    function generateAlphabeticRole(index) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        let num = index;
        while (num > 0) {
            num--;
            result = alphabet[num % 26] + result;
            num = Math.floor(num / 26);
        }
        return result || 'A';
    }

 
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'assign') {
            assignModeBtn.classList.add('active');
            teamModeBtn.classList.remove('active');
            assignControls.classList.remove('hidden');
            teamControls.classList.add('hidden');
            teamDisplay.classList.add('hidden');
            actionBtn.textContent = 'Assign Roles';
        } else {
            assignModeBtn.classList.remove('active');
            teamModeBtn.classList.add('active');
            assignControls.classList.add('hidden');
            teamControls.classList.remove('hidden');
            teamDisplay.classList.add('hidden');
            actionBtn.textContent = 'Team Up';
        }
    }
    generateBtn.addEventListener('click', () => {
        const playerCount = parseInt(playerCountInput.value);
        playersContainer.innerHTML = '';
        players = [];

        for (let i = 0; i < playerCount; i++) {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <h3>Trainer ${i + 1}</h3>
                <label for="playerName${i}">Name:</label>
                <input type="text" id="playerName${i}" placeholder="Trainer ${i + 1}">
                <p class="assigned-role">Not assigned</p>
            `;
            playersContainer.appendChild(card);
            players.push({
                nameInput: document.getElementById(`playerName${i}`),
                roleDisplay: card.querySelector('.assigned-role')
            });
        }

        actionBtn.disabled = false;
    });

    actionBtn.addEventListener('click', () => {
        if (currentMode === 'assign') {
            const playerCount = players.length;
            const roleType = roleTypeSelect.value;
            let roles = [];

            if (roleType === 'numeric') {
                roles = Array.from({ length: playerCount }, (_, i) => (i + 1).toString().padStart(3, '0'));
            } else {
                roles = Array.from({ length: playerCount }, (_, i) => generateAlphabeticRole(i + 1));
            }

            roles = shuffleArray(roles);

            players.forEach((player, index) => {
                const name = player.nameInput.value.trim() || `Trainer ${index + 1}`;
                player.roleDisplay.textContent = `${name} → Code ${roles[index]}`;
            });

            teamDisplay.classList.add('hidden');
        } else {
            const totalTrainers = players.length;
            const teamCount = parseInt(teamCountInput.value);
            const skipList = skipListInput.value.split(",").map(x => parseInt(x.trim().replace('Trainer ', ''), 10)).filter(x => !isNaN(x));
            const lockedGroup = lockedGroupInput.value.split(",").map(x => parseInt(x.trim().replace('Trainer ', ''), 10)).filter(x => !isNaN(x));
            const lockedTeams = parseInt(lockedTeamsInput.value, 10);
            
            const trainerNames = players.map((p, i) => p.nameInput.value.trim() || `Trainer ${i + 1}`);

            const teams = createTeams(totalTrainers, teamCount, skipList, lockedGroup, lockedTeams, trainerNames);
            
            teamsContainer.innerHTML = '';
            teams.forEach((team, idx) => {
                const div = document.createElement('div');
                div.className = 'team-card';
                const teamMembers = team.map(member => member.name);
                
                div.innerHTML = `
                    <h3>Squad ${idx + 1} (${teamMembers.length})</h3>
                    <ul class="team-members">${teamMembers.map(m => `<li>${m}</li>`).join('') || '(empty)'}</ul>
                `;
                teamsContainer.appendChild(div);
            });

            players.forEach((player, index) => {
                const trainerName = player.nameInput.value.trim() || `Trainer ${index + 1}`;
                let assignedTeam = 'N/A';
                teams.forEach((team, teamIndex) => {
                    if (team.some(member => member.name === trainerName)) {
                        assignedTeam = `Squad ${teamIndex + 1}`;
                    }
                });
                player.roleDisplay.textContent = assignedTeam;
            });
            
            teamDisplay.classList.remove('hidden');
        }
    });

    assignModeBtn.addEventListener('click', () => setMode('assign'));
    teamModeBtn.addEventListener('click', () => setMode('team'));

    setMode('assign');
});