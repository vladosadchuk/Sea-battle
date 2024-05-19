'use strict';

class Board {
    constructor() {
        this.tableId;
        this.tableArray = [];
        this.shipsToBePlaced = [];
        this.placingShip = {}; //{length: , direction: }
        this.placedShips = [];
    }

    emptyBoard() {
        this.tableArray = [];
        this.placedShips = [];
        this.shipsToBePlaced = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                row.push(0);
            }
            this.tableArray.push(row);
        }

        this.vizualizeShips();
    }

    pickShipModel(shipLength, shipDirection) {
        this.placingShip = { length: shipLength, direction: shipDirection, };

        const shipPick = document.getElementById("pickedShipModel");

        const pickVariants = [
            { class: "ship-4", length: 4, direction: "horizontal" },
            { class: "ship-3", length: 3, direction: "horizontal" },
            { class: "ship-2", length: 2, direction: "horizontal" },
            { class: "ship-4v", length: 4, direction: "vertical" },
            { class: "ship-3v", length: 3, direction: "vertical" },
            { class: "ship-2v", length: 2, direction: "vertical" },
            { class: "ship-1v", length: 1, direction: "vertical" },
        ];
        for (const variant of pickVariants) {
            if (shipLength === variant.length && shipDirection === variant.direction) {
                shipPick.setAttribute('class', variant.class);
            }
        }
    }

    clickCell(x, y, randomPlacement) {
        const shipLength = this.placingShip.length;
        const shipDirection = this.placingShip.direction;
    
        const handleShipRemoval = (x, y) => {
            for (const ship of this.placedShips) {
                const cellIndex = ship.shipCells.findIndex(cell => cell[0] === x && cell[1] === y);
                if (cellIndex !== -1) {
                    ship.deleteShip();

                    const shipIndex = this.placedShips.indexOf(ship);
                    this.placedShips.splice(shipIndex, 1);
                    this.shipsToBePlaced.push(ship.shipLength);
                }
            }
        };
    
        const handleShipPlacement = (x, y) => {
            if (this.isSafeToPlaceShip(x, y, randomPlacement)) {
                const index = this.shipsToBePlaced.indexOf(shipLength);
                if (index > -1) {
                    this.shipsToBePlaced.splice(index, 1);
                    const newShip = new Ship(x, y, shipLength, shipDirection, this.tableArray, this);
                    this.placedShips.push(newShip);
                    newShip.placeShip();
                }
            }
        };
    
        if (this.tableArray[x][y] === 1) {
            handleShipRemoval(x, y);
        } else {
            handleShipPlacement(x, y);
        }
    
        this.vizualizeShips();
    }

    isSafeToPlaceShip(x, y, randomPlacement) {
        const { length: shipLength, direction: shipDirection } = this.placingShip;
        const canPlaceHorizontally = y + shipLength <= 10;
        const canPlaceVertically = x + shipLength <= 10;
    
        if (!this.shipsToBePlaced.includes(shipLength)) {
            if(!randomPlacement) 
                alert(`You don't need to place ${shipLength}-decker ship`);
            return false;
        }
    
        const isValidCoordinate = (i, j) => i >= 0 && i < 10 && j >= 0 && j < 10;
        const isCellOccupied = (i, j) => this.tableArray[i][j] === 1;
    
        const isHorizontalPlacementSafe = () => {
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + shipLength; j++) {
                    if (isValidCoordinate(i, j) && (isCellOccupied(i, j) || !canPlaceHorizontally)) {
                        if(!randomPlacement) 
                            alert("Bad position");
                        return false;
                    }
                }
            }
            return true;
        };
    
        const isVerticalPlacementSafe = () => {
            for (let i = x - 1; i <= x + shipLength; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (isValidCoordinate(i, j) && (isCellOccupied(i, j) || !canPlaceVertically)) {
                        if(!randomPlacement) 
                            alert("Bad position");
                        return false;
                    }
                }
            }
            return true;
        };
    
        if (shipDirection === "horizontal") {
            return isHorizontalPlacementSafe();
        } else if (shipDirection === "vertical") {
            return isVerticalPlacementSafe();
        }
        
        return false;
    }

    randomShipPlacer() {
        this.emptyBoard();
        while (this.shipsToBePlaced.length > 0) {
            const shipLength = this.shipsToBePlaced[0];
            const shipDirection = (Math.random() < 0.5) ? "horizontal" : "vertical";

            this.pickShipModel(shipLength, shipDirection);

            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            this.clickCell(x, y, true);
        }
    }

    vizualizeShips() {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const id = `cell_${i}_${j}`;
                const cell = document.querySelector(`#${this.tableId} #${id}`);
                switch (this.tableArray[i][j]) {
                    case 0:
                        cell.classList.remove("ship");
                        break;
                    case 1:
                        cell.classList.add("ship");
                        break;
                    case 2:
                        cell.classList.add("blank")
                        break;
                    case 3:
                        cell.classList.add("shooted");
                        break;
                    case 4:
                        cell.classList.add("revealed");
                        break;
                }
            }
        }
    }

    removeCellListener(x, y) {
        const id = `cell_${x}_${y}`;
        const cell = document.querySelector(`#${this.tableId} #${id}`);
        const newCell = cell.cloneNode(true);
        cell.replaceWith(newCell);
        newCell.style.cursor = "auto";
    }

    checkAliveShips() {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.tableArray[i][j] === 1) return true;
            }
        }
        return false;
    }
}

class PlayerBoard extends Board {
    constructor() {
        super();
        this.tableId = "playerTable";
        this.aliveCells = []; //[x, y]
        this.possibleShoots = []; //[x, y]
        this.botCanShoot = false;
        this.createBoard();
        this.updateAliveCells();
    }

    createBoard() {
        const table = document.getElementById(this.tableId);

        const lettersRow = document.createElement('tr');
        lettersRow.appendChild(document.createElement('th'));

        for (let i = 0; i < 10; i++) {
            const letterCell = document.createElement('th');
            letterCell.textContent = String.fromCharCode(65 + i); //'A' - 65
            lettersRow.appendChild(letterCell);
        }
        table.appendChild(lettersRow);

        for (let i = 0; i < 10; i++) {
            const row = document.createElement('tr');

            const numberCell = document.createElement('th');
            numberCell.textContent = i + 1;
            row.appendChild(numberCell);

            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('td');
                cell.setAttribute('id', `cell_${i}_${j}`);

                cell.addEventListener('click', () => {
                    this.clickCell(i, j, false);
                });

                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        this.emptyBoard();
    }

    updateAliveCells() {
        this.aliveCells = [];

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.tableArray[i][j] === 1 || this.tableArray[i][j] === 0) 
                    this.aliveCells.push([i, j]);
            }
        }

        this.possibleShoots = this.possibleShoots.filter(cell => {
            const x = cell[0];
            const y = cell[1];
            return (this.tableArray[x][y] === 0 || this.tableArray[x][y] === 1);
        });
    }

    async botFireCell() {
        this.botCanShoot = true;
    
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
        const getRandomCell = (array) => {
            const randomIndex = Math.floor(Math.random() * array.length);
            return array[randomIndex];
        };
    
        const handleHit = (x, y) => {
            this.tableArray[x][y] = 3;

            for (const ship of this.placedShips) {
                const cellIndex = ship.shipCells.findIndex(cell => cell[0] === x && cell[1] === y);
                if (cellIndex !== -1) {
                    ship.deleteCell(cellIndex);
                }
            }

            updatePossibleShoots(x, y);
        };

        const handleMiss = (x, y) => {
            this.tableArray[x][y] = 2;
            this.botCanShoot = false;
        };
    
        const getNeighbors = (x, y) => [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1]
        ];
    
        const updatePossibleShoots = (x, y) => {
            const neighbors = getNeighbors(x, y);
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                    if (this.tableArray[nx][ny] === 0 || this.tableArray[nx][ny] === 1) {
                        this.possibleShoots.push([nx, ny]);
                    }
                }
            }

            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 && this.tableArray[nx][ny] === 3) {
                    if (nx === x) {
                        this.possibleShoots = this.possibleShoots.filter(cell => cell[0] === x);
                    }
                    if (ny === y) {
                        this.possibleShoots = this.possibleShoots.filter(cell => cell[1] === y);
                    }
                }
            }
        };
    
        const shoot = async () => {
            await delay(1000);
    
            if (!this.botCanShoot) return;
    
            let x, y;
            if (this.possibleShoots.length === 0) {
                [x, y] = getRandomCell(this.aliveCells);
            } else {
                [x, y] = getRandomCell(this.possibleShoots);
            }
    
            if (this.tableArray[x][y] === 1) {
                handleHit(x, y);
            } else {
                handleMiss(x,y);
            }
    
            this.updateAliveCells();
            this.vizualizeShips();
    
            if (this.botCanShoot) {
                await shoot();
            }
        };
    
        await shoot();
    }    
}

class BotBoard extends Board {
    constructor() {
        super();
        this.tableId = "botTable";
        this.createBoard();
    }

    createBoard() {
        const table = document.getElementById(this.tableId);

        const lettersRow = document.createElement('tr');
        lettersRow.appendChild(document.createElement('th'));

        for (let i = 0; i < 10; i++) {
            const letterCell = document.createElement('th');
            letterCell.textContent = String.fromCharCode(65 + i); //'A' - 65
            lettersRow.appendChild(letterCell);
        }
        table.appendChild(lettersRow);

        for (let i = 0; i < 10; i++) {
            const row = document.createElement('tr');

            const numberCell = document.createElement('th');
            numberCell.textContent = i + 1;
            row.appendChild(numberCell);

            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('td');
                cell.setAttribute('id', `cell_${i}_${j}`);
                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        this.emptyBoard();
    }

    fireCell(x, y) {
        let repeatTurn = false;
        if (this.canShoot) {
            if (this.tableArray[x][y] === 1) {
                this.tableArray[x][y] = 3;
                repeatTurn = true;

                for (const ship of this.placedShips) {
                    for (const [index, cell] of ship.shipCells.entries()) {
                        const coord = [x, y];
                        if (cell[0] === coord[0] && cell[1] === coord[1]) {
                            ship.deleteCell(index);
                        }
                    }
                }
            } else {
                this.tableArray[x][y] = 2; // 2 означає, що постріл не влучив
            }

            this.removeCellListener(x, y);
            this.vizualizeShips();
        }
        return repeatTurn;
    }

    revealShips() {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.tableArray[i][j] === 1) this.tableArray[i][j] = 4;
            }
        }
        this.vizualizeShips();
    }
}

class Ship {
    constructor(x, y, shipLength, shipDirection, tableArray, Board) {
        this.x = x;
        this.y = y;
        this.shipLength = shipLength;
        this.shipDirection = shipDirection;
        this.tableArray = tableArray;
        this.Board = Board;
        this.shipCells = []; // [x, y]
        this.importShipCells();
    }

    importShipCells() {
        if (this.shipDirection === "vertical") {
            for (let i = this.x; i < this.x + this.shipLength; i++) {
                this.shipCells.push([i, this.y]);
            }
        }
        if (this.shipDirection === "horizontal") {
            for (let j = this.y; j < this.y + this.shipLength; j++) {
                this.shipCells.push([this.x, j]);
            }
        }
    }

    deleteShip() {
        if (this.shipDirection === "horizontal") {
            for (let j = this.y; j < this.y + this.shipLength; j++) {
                this.tableArray[this.x][j] = 0;
            }
        }
        else if (this.shipDirection === "vertical") {
            for (let i = this.x; i < this.x + this.shipLength; i++) {
                this.tableArray[i][this.y] = 0;
            }
        }
    }

    placeShip() {
        if (this.shipDirection === "horizontal") {
            for (let j = this.y; j < this.y + this.shipLength; j++) {
                this.tableArray[this.x][j] = 1;
            }
        }
        else if (this.shipDirection === "vertical") {
            for (let i = this.x; i < this.x + this.shipLength; i++) {
                this.tableArray[i][this.y] = 1;
            }
        }
    }

    deleteCell(index) {
        this.shipCells.splice(index, 1);

        if (this.shipCells.length === 0) this.killShip();
    }

    killShip() {
        const inBounds = (i, j) => i >= 0 && i < 10 && j >= 0 && j < 10;
        
        const markSurroundingCells = (startX, endX, startY, endY) => {
            for (let i = startX; i <= endX; i++) {
                for (let j = startY; j <= endY; j++) {
                    if (inBounds(i, j) && this.tableArray[i][j] !== 3) {
                        this.tableArray[i][j] = 2;
                        this.Board.removeCellListener(i, j);
                    }
                }
            }
        };
        
        if (this.shipDirection === "horizontal") {
            markSurroundingCells(this.x - 1, this.x + 1, this.y - 1, this.y + this.shipLength);
        } else if (this.shipDirection === "vertical") {
            markSurroundingCells(this.x - 1, this.x + this.shipLength, this.y - 1, this.y + 1);
        }
    }
}

class Game {
    constructor() {
        this.playerBoard;
        this.botBoard;
        this.botTurn = false;
        this.createPlayerBoard();
        this.buttonEvents();
    }

    createPlayerBoard() {
        this.playerBoard = new PlayerBoard();
    }

    buttonEvents() {
        const models = [
            { id: "4_horizontal", length: 4, direction: "horizontal" },
            { id: "3_horizontal", length: 3, direction: "horizontal" },
            { id: "2_horizontal", length: 2, direction: "horizontal" },
            { id: "4_vertical", length: 4, direction: "vertical" },
            { id: "3_vertical", length: 3, direction: "vertical" },
            { id: "2_vertical", length: 2, direction: "vertical" },
            { id: "1_vertical", length: 1, direction: "vertical" },
        ];

        for (const model of models) {
            const element = document.getElementById(model.id);
            element.addEventListener("click", () => {
                this.playerBoard.pickShipModel(model.length, model.direction);
            });
        }

        const randomButton = document.getElementById("randomButton");
        randomButton.addEventListener("click", () => {
            this.playerBoard.randomShipPlacer();
        });

        const clearButton = document.getElementById("clearButton");
        clearButton.addEventListener("click", () => {
            this.playerBoard.emptyBoard();
        });

        const startButton = document.getElementById("startButton");
        startButton.addEventListener("click", () => {
            this.startGame();
        });
    }

    startGame() {
        if (this.playerBoard.shipsToBePlaced.length > 0) {
            alert(`Not all ships are placed.\nYou need to place ${this.playerBoard.shipsToBePlaced}`);
            return;
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.playerBoard.removeCellListener(i, j);
            }
        }

        this.botBoard = new BotBoard();
        this.botBoard.randomShipPlacer();

        const shipPickBox = document.getElementById("shipPick");
        shipPickBox.style.display = "none";

        const randomButton = document.getElementById("randomButton");
        randomButton.style.display = "none";

        const clearButton = document.getElementById("clearButton");
        clearButton.style.display = "none";

        const startButton = document.getElementById("startButton");
        startButton.style.display = "none";

        const botTable = document.getElementById("botTable");
        botTable.style.display = "block";

        this.botBoard.canShoot = true;

        this.botBoardListeners();
    }

    botBoardListeners() {
        const cells = document.querySelectorAll("#botTable td");
        for (const cell of cells) {
            const x = Number(cell.id.split("_")[1]);
            const y = Number(cell.id.split("_")[2]);
            cell.addEventListener("click", () => {
                if (this.botTurn || !this.checkWin()) return;
                else {
                    this.botTurn = !this.botBoard.fireCell(x, y);
                    this.botBoard.removeCellListener(x, y);

                    this.checkWin();
                    this.botStep();
                }
            });
        }
    }

    async botStep() {
        if (!this.botTurn || !this.checkWin()) return;
        await this.playerBoard.botFireCell();
        this.checkWin();
        this.botTurn = false;
    }

    checkWin() {
        if (!this.playerBoard.checkAliveShips() || !this.botBoard.checkAliveShips()) {
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    this.botBoard.removeCellListener(i, j);
                }
            }
            this.botBoard.revealShips();
            const winMessage = document.getElementById("winMessage");
            winMessage.style.display = 'block';
            if (this.playerBoard.checkAliveShips()) {
                winMessage.innerHTML = "You have won";
            } else {
                winMessage.innerHTML = "You have lost";
            }

            return false;
        }
        return true;
    }
}

const game = new Game();
