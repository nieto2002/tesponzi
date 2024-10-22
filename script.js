// script.js

let selectedTeam = '';
const modal = document.getElementById('confirmModal');
const resultBtn = document.getElementById('result-btn');
const retryBtn = document.getElementById('retry-btn');
const teamButtons = document.querySelector('.team-buttons');
const resultElement = document.getElementById('result');
const countdownElement = document.getElementById('countdown');
const connectBtn = document.querySelector('.connect-btn');
const nftValueElement = document.querySelector('.nft-value');
const rewardsElement = document.querySelector('.rewards');
const balanceElement = document.querySelector('.balance');
const mySoldiersContainer = document.getElementById('my-soldiers');
const battleContent = document.getElementById('battle-content');
const noSoldierMessage = document.getElementById('no-soldier-message');
const depositBtn = document.getElementById('deposit-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
let mySoldiers = [];
let nftValue = 0; // Initial NFT value
let rewards = 0; // Initial rewards
let balance = 100; // Initial balance
let highestPercentage = 0;  // Para almacenar el porcentaje más alto de NFT
const porcentajeElement = document.querySelector('.porcentaje');

let recompensa = 0.00000000000000;
let recompensaFormateada = recompensa.toFixed(2); // Esto devuelve "0.38"
console.log(recompensaFormateada);



document.getElementById('alien-btn').addEventListener('click', () => showConfirmation('alien'));
document.getElementById('soldier-btn').addEventListener('click', () => showConfirmation('soldier'));
resultBtn.addEventListener('click', showResult);
retryBtn.addEventListener('click', resetGame);
document.getElementById('confirm-yes').addEventListener('click', confirmSelection);
document.getElementById('confirm-no').addEventListener('click', closeModal);
connectBtn.addEventListener('click', connectWallet);
depositBtn.addEventListener('click', deposit);
withdrawBtn.addEventListener('click', withdraw);

// Actualizar la vista de "Mis Soldados" para mostrar soldados comprados
function updateMySoldiersView() {
    const mySoldiersContainer = document.getElementById('my-soldiers');
    mySoldiersContainer.innerHTML = ''; // Limpiar el contenido actual

    if (mySoldiers.length === 0) {
        mySoldiersContainer.innerHTML = '<p class="empty-message">Aún no tienes soldados. Compra uno en la página de inicio.</p>';
    } else {
        mySoldiers.forEach((soldier, index) => {
            // Aquí imprimimos el nivel del soldado para depuración
            console.log("Nivel del soldado:", soldier.level);

            // Crear la tarjeta del soldado
            const soldierCard = document.createElement('div');
            soldierCard.className = 'soldier-card';
            
            // Añadir el nivel y la imagen
            soldierCard.innerHTML = `                
                <div class="level-bar">Nivel: ${soldier.level}</div>
                <img src="soldado2.jpg" alt="${soldier.name}" width="200" height="200">
                <h3>${soldier.name}</h3>
                <p class="soldier-description">Valor: ${soldier.value}$ - Porcentaje de ganancia: ${soldier.profit}%</p>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${(soldier.health / 15) * 100}%;"></div>
                </div>
                <p class="health-number">${Math.floor(soldier.health)}</p>
            `;

            // Verificar si el soldado no es de nivel 1 para agregar la barra de energía
            if (soldier.level > 1) { // Solo niveles mayores a 1 muestran la barra de energía
                const healthBar = document.createElement('div');
                healthBar.className = 'health-bar'; // Clase de la barra de energía
                healthBar.innerHTML = `
                    <div class="health-fill" style="width: ${soldier.health}%;">
                        ${soldier.health}%
                    </div>
                `;

                // Agregar la barra de energía a la tarjeta del soldado
                soldierCard.appendChild(healthBar);
            }
            
            // Añadir la tarjeta del soldado al contenedor principal
            mySoldiersContainer.appendChild(soldierCard);
        });
    }
}


// Inicializa la vista con los soldados existentes (si hay alguno)
updateMySoldiersView();

function showConfirmation(team) {
    selectedTeam = team;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    selectedTeam = '';
}

function confirmSelection() {
    modal.style.display = 'none';
    document.getElementById('alien-btn').classList.remove('selected');
    document.getElementById('soldier-btn').classList.remove('selected');
    document.getElementById(`${selectedTeam}-btn`).classList.add('selected');

    const selectedIcon = document.querySelector(`.${selectedTeam}-icon`).cloneNode(true);
    teamButtons.innerHTML = '';
    teamButtons.appendChild(selectedIcon);
}

function showResult() {
    if (!selectedTeam) {
        alert('Por favor, selecciona un bando antes de ver el resultado.');
        return;
    }

    const winningTeam = Math.random() < 0.5 ? 'alien' : 'soldier';

    if (winningTeam === selectedTeam) {
        const totalValue = nftValue + rewards;
        const rewardAmount = (totalValue * highestPercentage) / 100;

        rewards += rewardAmount; // Sumar la recompensa calculada
        resultElement.innerHTML = `¡Felicidades! Tu bando ha ganado.<br>Has ganado un ${highestPercentage}% de tu total, lo que equivale a ${rewardAmount.toFixed(2)}$.`;
        resultElement.style.color = '#4CAF50';

        updateRewards(); // Actualizar la visualización de recompensas
        reduceEnergyOnWin(); // Reducir energía de los soldados
    } else {
        resultElement.innerHTML = `Lo siento, el bando contrario ha ganado.<br>Mejor suerte la próxima vez.`;
        resultElement.style.color = '#f44336';
    }

    resultBtn.style.display = 'none';
    retryBtn.style.display = 'block';
    startCountdown();
}

// Función para reducir un punto de energía del primer soldado del equipo ganador
function reduceEnergyOnWin() {
    let soldierInactivated = false;

    mySoldiers.forEach((soldier, index) => {
        // Comprobamos si el soldado es de nivel 1
        if (soldier.level > 1) {  // Solo los soldados de nivel mayor a 1 perderán energía
            if (soldier.health > 0) {
                soldier.health -= 1;

                if (soldier.health <= 0) {
                    soldier.health = 0;
                    soldier.profit = 0;  // El soldado ya no genera ganancias.
                    soldierInactivated = true;
                }

                const healthPercentage = (soldier.health / 15) * 100;
                const healthFill = document.querySelectorAll('.health-fill')[index];
                const healthNumber = document.querySelectorAll('.health-number')[index];

                if (healthFill) healthFill.style.width = `${healthPercentage}%`;
                if (healthNumber) healthNumber.textContent = Math.floor(soldier.health);
            }
        }
    });

    if (soldierInactivated) {
        highestPercentage = getHighestActivePercentage(); // Actualiza el mayor porcentaje
        updatePorcentaje();  // Actualiza la vista del porcentaje
        alert('Un soldado ha quedado inactivo. El porcentaje de recompensa ha sido actualizado.');
    }

    updateMySoldiers(); // Actualiza la visualización de los soldados.
}


function updatePorcentaje() {
    porcentajeElement.textContent = `Porcentaje: ${highestPercentage}%`;
}



function updateRewards() {
    rewardsElement.textContent = `Recompensas: ${rewards.toFixed(2)}$`;
}

function startCountdown() {
    let timeLeft = 3;
    retryBtn.disabled = true;
    countdownElement.style.display = 'block';

    const countdownInterval = setInterval(() => {
        countdownElement.textContent = `Podrás volver a intentar en ${timeLeft} segundos`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            retryBtn.disabled = false;
            countdownElement.style.display = 'none';
            countdownElement.textContent = '';
        }
    }, 1000);
}

function resetGame() {
    selectedTeam = '';
    resultElement.innerHTML = '';
    resultBtn.style.display = 'block';
    retryBtn.style.display = 'none';

    teamButtons.innerHTML = `
        <div class="team-option">
            <svg class="alien-icon" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#4CAF50"/>
                <circle cx="35" cy="40" r="10" fill="black"/>
                <circle cx="65" cy="40" r="10" fill="black"/>
                <path d="M30 70 Q50 80 70 70" stroke="black" stroke-width="5" fill="none"/>
                <path d="M20 20 Q30 40 50 30 Q70 40 80 20" stroke="black" stroke-width="3" fill="none"/>
            </svg>
            <button id="alien-btn">Bando Alien</button>
        </div>
        <div class="team-option">

            <svg class="soldier-icon" viewBox="0 0 100 100">
              <img src="imagenes/soldado1.jpg" width="200" height="200">  
            </svg>
            <button id="soldier-btn">Bando Soldado</button>
        </div>
    `;

    document.getElementById('alien-btn').addEventListener('click', () => showConfirmation('alien'));
    document.getElementById('soldier-btn').addEventListener('click', () => showConfirmation('soldier'));
}

function connectWallet() {
    // Simulamos la conexión de la billetera
    connectBtn.textContent = 'Conectado';
    connectBtn.disabled = true;
    updateNFTValue();
    updateRewards();
    updateBalance();
}

function updateNFTValue() {
    nftValueElement.textContent = `Valor de NFT: ${nftValue}$`;
}

function updateRewards() {
    rewardsElement.textContent = `Recompensas: ${rewards.toFixed(2)}$`;
}


function updateBalance() {
    balanceElement.textContent = `Saldo: ${balance}$`;
}

function updatePorcentaje() {
    porcentajeElement.textContent = `Porcentaje: ${highestPercentage}%`;
}

// Manejar la navegación del menú
document.querySelectorAll('.menu-item').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        
        const sectionId = this.getAttribute('data-section');
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        if (sectionId === 'batallas') {
            checkSoldierRequirement();
        }
    });
});

// Manejar los botones de compra
document.querySelectorAll('.buy-soldier').forEach(button => {
    button.addEventListener('click', function() {
        const soldierName = this.getAttribute('data-soldier');
        const level = this.getAttribute('data-level');
        const value = parseInt(this.getAttribute('data-value'));
        const profit = parseInt(this.getAttribute('data-profit'));
        const soldierImage = this.closest('.soldier-card').querySelector('img').src;
        buySoldier(soldierName, level, value, profit, soldierImage);
    });
});

function buySoldier(name, level, value, profit, image) {
    if (balance >= value) {
        balance -= value;
        nftValue += value;  // Sumar el valor del NFT comprado a nftValue
        mySoldiers.push({ name, level, value, profit, image, health: 15 });
        updateMySoldiers();
        updateBalance();
        updateNFTValue();

        // Verificar si el nuevo porcentaje es el más alto
        if (profit > highestPercentage) {
            highestPercentage = profit;
            updatePorcentaje();  // Actualizar el porcentaje mostrado
        }

        alert(`Has comprado un ${name} de nivel ${level}`);
    } else {
        alert('No tienes suficiente saldo para comprar este soldado.');
    }
}

function updateMySoldiers() {
    mySoldiersContainer.innerHTML = ''; // Limpiar el contenido actual

    if (mySoldiers.length === 0) {
        mySoldiersContainer.innerHTML = '<p class="empty-message">Aún no tienes soldados. Compra uno en la página de inicio.</p>';
    } else {
        mySoldiers.forEach((soldier, index) => {
            const soldierCard = document.createElement('div');
            soldierCard.className = 'soldier-card';

            // Crear la tarjeta del soldado
            soldierCard.innerHTML = `
                <div class="level-bar">Nivel: ${soldier.level}</div>
                <img src="${soldier.image}" alt="${soldier.name}" width="200" height="200">
                <h3>${soldier.name}</h3>
                <p class="soldier-description">Valor: ${soldier.value}$ - Porcentaje de ganancia: ${soldier.profit}%</p>
            `;

            // Mostrar que el soldado está inactivo si su energía es 0
            if (soldier.health === 0) {
                soldierCard.innerHTML += `<p class="inactive-message">Este soldado está inactivo.</p>`;

                // Añadir el botón de "Quemar" para los soldados inactivos
                const burnButton = document.createElement('button');
                burnButton.textContent = 'Quemar';
                burnButton.className = 'burn-button';
                burnButton.addEventListener('click', () => burnSoldier(index));

                soldierCard.appendChild(burnButton);
            }

            // Agregar la barra de salud si el soldado tiene energía
            if (soldier.level > 1) {
                const healthPercentage = (soldier.health / 15) * 100; // Convertir la salud a porcentaje basado en 15

                const healthBar = document.createElement('div');
                healthBar.className = 'health-bar';
                healthBar.innerHTML = `
                    <div class="health-fill" style="width: ${healthPercentage}%; position: relative;">
                        <span class="health-number" style="position: absolute; top: -1px; left: 50%; transform: translateX(-50%); font-weight: bold; color: white;">
                            ${Math.floor(soldier.health)} / 15
                        </span>
                    </div>
                `;

                soldierCard.appendChild(healthBar);
            }

            // Añadir la tarjeta del soldado al contenedor
            mySoldiersContainer.appendChild(soldierCard);
        });
    }
}

// Función para manejar el quemado del soldado
// Función para manejar el quemado del soldado
// Función para manejar el quemado del soldado
function burnSoldier(index) {
    // Mostrar el modal de confirmación
    const burnModal = document.getElementById('burnConfirmModal');
    burnModal.style.display = 'block';

    // Manejar el botón "Sí"
    document.getElementById('burn-yes').onclick = function() {
        // Cerrar el modal
        burnModal.style.display = 'none';

        // Obtener el valor del soldado que se va a quemar
        const burnedSoldierValue = mySoldiers[index].value;

        // Calcular el 70% del valor del soldado para sumar a las recompensas
        const rewardFromBurn = burnedSoldierValue * 0.70;
        rewards += rewardFromBurn; // Añadir el 70% a las recompensas

        // Restar el valor del soldado quemado del valor total de NFT
        nftValue -= burnedSoldierValue;

        // Eliminar el soldado del array
        mySoldiers.splice(index, 1);

        // Actualizar la vista después de quemar al soldado
        updateMySoldiers();
        updateNFTValue();  // Actualizar el valor de NFT en la UI
        updateRewards();  // Actualizar las recompensas en la UI

        // Mostrar mensaje de éxito
        alert(`Soldado quemado exitosamente. ${burnedSoldierValue}$ ha sido restado del valor de NFT y ${rewardFromBurn.toFixed(2)}$ ha sido añadido a las recompensas.`);
    };

    // Manejar el botón "No"
    document.getElementById('burn-no').onclick = function() {
        // Cerrar el modal sin quemar el soldado
        burnModal.style.display = 'none';
    };
}

// Inicialización
updateMySoldiers();


// Ejemplo: Reducir la energía del primer soldado al 80%
updateSoldierEnergy(0, 80);

function getHighestActivePercentage() {
    let highest = 0;
    mySoldiers.forEach(soldier => {
        if (soldier.health > 0 && soldier.profit > highest) {
            highest = soldier.profit;
        }
    });
    return highest;
}


function reduceSoldierEnergy() {
    mySoldiers.forEach((soldier, index) => {
        if (soldier.health > 0) {
            // Reducir energía en un 5% de la energía actual del soldado
            let reductionAmount = soldier.health * 0.05; // 5% de la energía actual
            let newHealth = soldier.health - reductionAmount;

            // Asegurarse de que la energía no sea menor de 0
            if (newHealth < 0) {
                newHealth = 0;
            }

            // Actualizar la energía del soldado
            mySoldiers[index].health = newHealth;

            // Calcular el nuevo porcentaje basado en 15 puntos de salud
            const healthPercentage = (newHealth / 15) * 100;

            // Actualizar la barra de energía visualmente
            const healthFill = document.querySelectorAll('.health-fill')[index];
            healthFill.style.width = `${healthPercentage}%`;

            // Actualizar el número de energía visible si está disponible
            const healthNumber = document.querySelectorAll('.health-number')[index];
            if (healthNumber) {
                healthNumber.textContent = Math.floor(newHealth);
            }
        }
    });
}

console.log.reduceSoldierEnergy()
console.log(soldier.health);

function checkSoldierRequirement() {
    if (mySoldiers.length === 0) {
        battleContent.style.display = 'none';
        noSoldierMessage.style.display = 'block';
    } else {
        battleContent.style.display = 'block';
        noSoldierMessage.style.display = 'none';
    }
}

function deposit() {
    const amount = prompt("Ingrese la cantidad a depositar:");
    if (amount && !isNaN(amount) && amount > 0) {
        balance += parseFloat(amount);
        updateBalance();
        alert(`Has deposit
ado ${amount}$ exitosamente.`);
    } else {
        alert("Por favor ingrese una cantidad válida.");
    }
}

function withdraw() {
    const amount = prompt("Ingrese la cantidad a retirar:");
    if (amount && !isNaN(amount) && amount > 0) {
        if (balance >= parseFloat(amount)) {
            balance -= parseFloat(amount);
            updateBalance();
            alert(`Has retirado ${amount}$ exitosamente.`);
        } else {
            alert("Saldo insuficiente para realizar el retiro.");
        }
    } else {
        alert("Por favor ingrese una cantidad válida.");
    }
}

console.log(soldier.level);

// Inicialización
updateMySoldiers();
checkSoldierRequirement();