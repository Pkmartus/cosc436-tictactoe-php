//const { join } = require("path");

var xPlayer = '';
var oPlayer = '';

//displays the how to play guide
function openHowToPlayModal() {
    document.getElementById("howToPlayModal").style.display = "block";
}

//closes th how to play guide
function closeHowToPlayModal() {
    document.getElementById("howToPlayModal").style.display = "none";
}

//displays a popup allowing the user to choose X or O
function closeNewGameModal() {
    document.querySelector(".new-game-popup-container").style.display = "none";
}

var connectedSocket = null;

//checks if socket exists and sends a message to the server
function sendToServer(messageType, message) {
    try {
        if (!connectedSocket) createSocket();
        message.type = messageType; //removes the need to rewrite all calls to this method
        connectedSocket.send(JSON.stringify(message)); // send msg to server
    } catch (err) {
        alert("System error 987: " + err + " contact us, or try again later");
    }
}

//creates the socket and sets message listeners
function createSocket() {
    if (connectedSocket) {
        alert("Already connected");
        return;
    }

    connectedSocket = new WebSocket("ws://" + window.location.hostname + ":5000");
    connectedSocket.onmessage = function (event) {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case "LOGIN":
                if (message.success) {
                        // alert("hi");
                        document.querySelector('.enter-name-container').style.display = 'none';
                        // document.querySelector('.whos-turn-for-current-game-for-user-container').style.display = 'block';
                        document.querySelector('.whos-turn-for-current-game-for-user-container').classList.add('whos-turn-visible');

                        document.querySelector('.main-content-container').style.display = 'flex';
                    }
                    break;
            case "UPDATED-USER-LIST-AND-STATUS":
                //update user logic
                break;
            case "PLAY":
                //play logic
                break;
            case "MOVE":
                //move logic
                break;
            case "END-GAME":
                //end game logic
                break;
            default:
                console.log("Unknown message type:", message.type);
                break;
        }

    }

    //js socket.io code
    // try {
    //     connectedSocket = io(`http://${window.location.hostname}:5000`);
    //     console.log(connectedSocket + " in createSocket");
    // } catch (err) {
    //     alert('connectedSocket create error, contact us');
    //     connectedSocket = null;
    //     return;
    // }

    // //when the login is succsessful hide the login window and show the rest of the content
    // connectedSocket.on("LOGIN", function (data) {
    //     if (data.success) {
    //         // alert("hi");
    //         document.querySelector('.enter-name-container').style.display = 'none';
    //         // document.querySelector('.whos-turn-for-current-game-for-user-container').style.display = 'block';
    //         document.querySelector('.whos-turn-for-current-game-for-user-container').classList.add('whos-turn-visible');

    //         document.querySelector('.main-content-container').style.display = 'flex';

    //         if (data.screenName && data.status) {
    //             updateLists(data.screenName, data.status);
    //         }
    //     } else {
    //         alert(data.message);
    //     }
    // });

    // //update the lists
    // connectedSocket.on('UPDATED-USER-LIST-AND-STATUS', (data) => {
    //     updateLists(data.screenNames, data.status);
    // })

    // //start a game
    // connectedSocket.on('PLAY', function (data) {
    //     //reset current board state
    //     startGame(data)
    //     newGameButton.style.pointerEvents = 'none';
    //     newGameButton.style.display = 'none';

    // });
    // //handle a move from server
    // connectedSocket.on('MOVE', function (data) {
    //     console.log("MOVE received", data);
    //     updateTurnCard(data.screenname);
    //     applyMoveToBoard(data.screenname, data.cell);
    // });

    // //end the game
    // connectedSocket.on('END-GAME', (data) => {
    //     console.log("END-GAME fired", data);
    //     //disable listeners for board
    //     disableListeners();

    //     displayTheWinner(data.winner);
    //     //reenable new game button
    //     newGameButton.style.display = 'block';
    //     newGameButton.style.pointerEvents = 'auto';
    //     newGameButton.addEventListener('click', () => {
    //         document.querySelector(".new-game-popup-container").style.display = "block";
    //     });
    // });
}
//handles the determined winner and displays it on the current turn card
function displayTheWinner(winner) {
    const winnerText = document.querySelector(".current-turn");
    winnerText.textContent = "Result:"
    // display draw, winner name if x, winner name if o
    if (winner === 'D') {
        whosSymbol.textContent = '';
        whosScreenname.textContent = "It's a Draw!";
    } else if (winner === 'X') {
        whosSymbol.textContent = 'X';
        whosScreenname.textContent = xPlayer + ' Wins!';
    } else if (winner === 'O') {
        whosSymbol.textContent = 'O';
        whosScreenname.textContent = oPlayer + ' Wins!';
    }
}
//populates the html of the idle users list and puts together the list of matches before calling 
//updateMatches to finish setting up the html for that.
function updateLists(screenNames, status) {
    //get divs for clients
    var idleClientsBody = document.getElementById("idleClientsBody");
    idleClientsBody.innerHTML = '';

    //list for active matches
    var matches = []

    screenNames.forEach((screenName, index) => {
        // Add to idle list if: game is 'idle' OR the idle flag is true
        if (status[index].game == 'idle' || status[index].idle === true) {
            var newRow = document.createElement('div');
            newRow.classList.add('idle-client-name');
            newRow.innerHTML = screenName;
            idleClientsBody.appendChild(newRow);
        }

        // Add to matches table if: game is NOT 'idle' (has a game_id)
        if (status[index].game !== 'idle') {
            // check if match is already in array
            let existingMatch = matches.find(m => m.id === status[index].game);
            if (existingMatch) {
                if (status[index].position === 'x')
                    existingMatch.playerX = screenName;
                else
                    existingMatch.playerO = screenName;
            } else {
                let newMatch = { id: status[index].game };
                if (status[index].position === 'x') {
                    // matches.push({ id: status[index].game, playerX: screenName });
                    newMatch.playerX = screenName;
                    newMatch.playerO = null;
                }
                else {
                    // matches.push({ id: status[index].game, playerO: screenName });
                    newMatch.playerX = null;
                    newMatch.playerO = screenName;
                }
                matches.push(newMatch);
            }
        }
    });
    updateMatches(matches, userScreenName);
}

//adds the html rows for matches and buttons where needed
function updateMatches(matches, currentUser) {
    var allMatchesBody = document.getElementById("all-matches-body");
    allMatchesBody.innerHTML = '';

    matches.forEach(match => {
        var newRow = document.createElement('div');
        newRow.classList.add('match-row');

        // var joinButton = document.createElement('button');
        // joinButton.classList.add('join-match-button');
        // joinButton.addEventListener('click', joinMatch(match.id)); //add event listener for button

        var xContainer = document.createElement('div');
        xContainer.classList.add('x-name-container');

        // Create O container
        var oContainer = document.createElement('div');
        oContainer.classList.add('o-name-container')

        //fill X column
        if (match.playerX) {
            var xButton = document.createElement('button');
            xButton.classList.add('x-name-btn');
            xButton.innerHTML = match.playerX;
            xButton.disabled = true;
            xContainer.appendChild(xButton);
        } else {
            var xJoinButton = document.createElement('button');
            xJoinButton.classList.add('x-name-btn');
            xJoinButton.innerHTML = 'Join';
            if (match.playerO === currentUser) {
                xJoinButton.disabled = true;
            } else {
                xJoinButton.addEventListener('click', function () {
                    joinMatch(match.id, 'x');
                });
            }
            xContainer.appendChild(xJoinButton);
        }

        //fill O column
        if (match.playerO) {
            var oButton = document.createElement('button');
            oButton.classList.add('o-name-btn');
            oButton.innerHTML = match.playerO;
            oButton.disabled = true;
            oContainer.appendChild(oButton);
        } else {
            var oJoinButton = document.createElement('button');
            oJoinButton.classList.add('o-name-btn');
            oJoinButton.innerHTML = 'Join';
            if (match.playerX === currentUser) {
                oJoinButton.disabled = true;
            } else {
                oJoinButton.addEventListener('click', function () {
                    joinMatch(match.id, 'o');
                });
            }
            oContainer.appendChild(oJoinButton);
        }

        //add columns to row
        newRow.appendChild(xContainer);
        newRow.appendChild(oContainer);
        allMatchesBody.appendChild(newRow);
    });
}


//get references to the current turn elements
const whosSymbol = document.querySelector('.x-or-o');
const whosScreenname = document.querySelector('.player-name')
const currentTurnText = document.querySelector(".current-turn");
const whoX = document.querySelector(".whos-x");
const whoO = document.querySelector(".whos-o");

function startGame(play) {
    //reset board if game new
    isGameOver = false;
    currentBoardState = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    currentTurnText.textContent = "Current Turn";
    displayBoard(currentBoardState); //update the board to empty
    //set the values in the who's turn card
    whosSymbol.textContent = 'X';
    whosScreenname.textContent = play.xPlayerScreenname;
    //disable the new game button
    newGameButton.style.pointerEvents = 'none';
    newGameButton.style.display = 'none';
    //set players to make cards easier to populate
    xPlayer = play.xPlayerScreenname;
    oPlayer = play.oPlayerScreenname;

    whoX.textContent = "X: " + xPlayer;
    whoO.textContent = "O: " + oPlayer;
}

//placeholder function for join game buttons
function joinMatch(matchid, position) {
    sendToServer('JOIN', { gameId: matchid, position: position });
    currentUserMoveChar = position.toUpperCase();
    isCurrentUsersTurn = position === 'x';
}

//change the turn card to reflect who's next
function updateTurnCard(lastPlayedName) {
    whosSymbol.textContent = lastPlayedName === xPlayer ? 'O' : 'X';
    whosScreenname.textContent = lastPlayedName === xPlayer ? oPlayer : xPlayer;
}

const screennameInput = document.querySelector('.screenname-input');
const submitButton = document.querySelector('.submit-username-button');
const newGameButton = document.querySelector(".new-game-button");
const oOption = document.querySelector(".o-option");
const xOption = document.querySelector(".x-option");

// store user's screenname
let userScreenName = "";

//listener for the login submit button
submitButton.addEventListener('click', () => {
    const screenname = screennameInput.value.trim();

    if (screenname == "") {
        alert("Please enter a screen name");
        return;
    }

    userScreenName = screenname;
    sendToServer("LOGIN-screen-name", { screenname: screenname });
});

newGameButton.addEventListener('click', () => {
    document.querySelector(".new-game-popup-container").style.display = "block";
});

xOption.addEventListener('click', () => {
    sendToServer('NEW-GAME', { screenname: userScreenName, position: 'x' });
    currentUserMoveChar = 'X';
    isCurrentUsersTurn = true;
    closeNewGameModal();
});

oOption.addEventListener('click', () => {
    sendToServer('NEW-GAME', { screenname: userScreenName, position: 'o' });
    currentUserMoveChar = 'O';
    isCurrentUsersTurn = false;
    closeNewGameModal();
});

createSocket(); 