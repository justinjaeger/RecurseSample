// CONSTANTS / VARIABLES

let GRID = 3;

const COMPUTER_LETTER = 'o';
const USER_LETTER = 'x';

const runBoard = () => {
    const winningCombos = [];
    for (let i = 0; i < GRID*GRID; i++) {
        // create winning rows
        if ((i % GRID) === 0) {
            let wc = [];
            for (let j = 0; j < GRID; j++) {
                wc.push(i+j);
            }
            winningCombos.push(wc);
        }
        // create winning cols
        if (i-GRID < 0) {
            let wc = [];
            for (let j = 0; j < GRID; j++) {
                wc.push(i+(GRID*j));
            }
            winningCombos.push(wc);
        }
        // create winning diags
        if (i === 0) {
            let wc = [];
            for (let j = 0; j < GRID; j++) {
                wc.push(i+((GRID*j)+j));
            }
            winningCombos.push(wc);
        }
        if (i === GRID-1) {
            let wc = [];
            for (let j = 0; j < GRID; j++) {
                wc.push(i+((GRID*j)-j));
            }
            winningCombos.push(wc);
        }
    }


    const winningPattern = [null];
    for (let i = 1; i < GRID; i++) {
        winningPattern.push(USER_LETTER);
    }

    // VARIABLES

    let userTurn = true;
    let isWinner = false;
    let timeout = undefined;

    // METHODS

    // returns an array of 'x', 'o', or null
    const getBoardState = () => {
        const squares = [];
        for (let i = 0; i < GRID*GRID; i++) {
            const el = document.getElementById(`square${i}`);
            if (!el) return;
            const xOrO = el.classList.contains(USER_LETTER)
                ? USER_LETTER
                : el.classList.contains(COMPUTER_LETTER)
                ? COMPUTER_LETTER
                : null;
            squares.push(xOrO);
        }
        return squares;
    }

    const getWinningMove = (letter) => {
        const boardState = getBoardState();

        for (let winningCombo of winningCombos) {
            // if there are two o's and a null in a row, return the null index
            let nullSpaceIndex = undefined;
            let winningP = [...winningPattern];
            for (let index of winningCombo) {
                const spaceValue = boardState[index];
                // if winningPattern contains the value, remove it
                const indexOfSq = winningP.indexOf(spaceValue);
                if (indexOfSq !== -1) {
                    winningP.splice(indexOfSq, 1);
                }
                if (spaceValue === null) {
                    nullSpaceIndex = index;
                }
            }
            if (winningP.length === 0) {
                return nullSpaceIndex;
            }
        }
        return undefined;
    }

    const getComputerMoveIndex = () => {
        const boardState = getBoardState();
        // computer should make a winning move if possible
        const winningMoveIndex = getWinningMove(COMPUTER_LETTER);
        if (winningMoveIndex !== undefined) {
            return winningMoveIndex;
        }
        // else, block a potential winning move by the user
        const blockingMoveIndex = getWinningMove(USER_LETTER);
        if (blockingMoveIndex !== undefined) {
            return blockingMoveIndex;
        }
        // else, choose a random null square
        const nullSquareIndexes = [];
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === null) {
                nullSquareIndexes.push(i);
            }
        }
        const randomIndex = Math.floor(Math.random() * nullSquareIndexes.length);
        return nullSquareIndexes[randomIndex];
    }

    const onDeclareWinner = (outcome) => {
        isWinner = true;
        const computerStatusEl = document.getElementById('computer-status');
        if (!computerStatusEl) return;
        computerStatusEl.innerText =
            outcome === 'tie'
            ?`It's a tie!`
            : outcome === USER_LETTER
            ? `You win!`
            : `Computer wins!`;
    }

    const onCheckOutcome = () => {
        const boardState = getBoardState();
        for (let winningCombo of winningCombos) {
            const hasWinner = winningCombo.reduce((acc, curr) => {
                if (boardState[acc] !== boardState[curr]) {
                    acc = false;
                }
                return acc;
            })
            if (hasWinner !== false) {
                return boardState[winningCombo[0]];
            }
        }
        if (!boardState.includes(null)) {
            return 'tie';
        }
        return undefined;
    }

    const onComputerTurn = () => {
        userTurn = false;
        const computerStatusEl = document.getElementById('computer-status');
        if (!computerStatusEl) return;
        computerStatusEl.innerText = 'computer is thinking...';
        timeout = setTimeout(() => {
            const moveIndex = getComputerMoveIndex();
            const el = document.getElementById(`square${moveIndex}`);
            if (!el) return;
            el.classList.add(COMPUTER_LETTER);
            // then reset the other stuff
            const outcome = onCheckOutcome();
            if (outcome) {
                return onDeclareWinner(outcome);
            }
            computerStatusEl.innerText = 'Your turn!';
            userTurn = true;
            timeout = undefined;
        }, 1000)
    }

    const getIsViableMove = (i) => {
        if (isWinner) return false;
        if (!userTurn) return false;
        const boardState = getBoardState();
        if (boardState[i] === null) return true;
        return false;
    }

    const onClickSquare = (i) => {
        const isViableMove = getIsViableMove(i);
        if (!isViableMove) return;
        const el = document.getElementById(`square${i}`);
        if (!el) return;
        el.classList.add(USER_LETTER);
        const outcome = onCheckOutcome();
        if (outcome) {
            return onDeclareWinner(outcome);
        }
        onComputerTurn();
    }

    const resetBoard = () => {
        aboveBoard.removeChild(gridSizeInput);
        document.body.removeChild(board);
        document.body.removeChild(aboveBoard);
        document.body.removeChild(belowBoard);
        timeout && clearTimeout(timeout)
        runBoard();
    }

    // CREATE BOARD

    const aboveBoard = document.createElement('div');
    aboveBoard.setAttribute('id', 'above-board');
    document.body.appendChild(aboveBoard);

    const board = document.createElement('div');
    board.setAttribute('id', 'board');
    board.style.height = `${GRID*125}px`;
    board.style.width = `${GRID*125}px`;
    document.body.appendChild(board);

    const belowBoard = document.createElement('div');
    belowBoard.setAttribute('id', 'below-board');
    document.body.appendChild(belowBoard);

    const computerStatusText = document.createElement('div');
    computerStatusText.setAttribute('id', 'computer-status');
    computerStatusText.innerText = 'Your turn!';
    aboveBoard.appendChild(computerStatusText);

    const gridSizeInput = document.createElement('input');
    gridSizeInput.setAttribute('id', 'grid-size-input');
    gridSizeInput.setAttribute('type', 'number');
    gridSizeInput.setAttribute('min', '2');
    gridSizeInput.setAttribute('max', '4');
    gridSizeInput.setAttribute('value', GRID);
    gridSizeInput.addEventListener('change', (e) => {
        const val = e.target.value;
        GRID = val;
        resetBoard();
    })
    aboveBoard.appendChild(gridSizeInput);

    for (let i = 0; i < GRID*GRID; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', `square${i}`);
        square.setAttribute('class', `square`);
        square.addEventListener('click', () => onClickSquare(i));
        board.appendChild(square);
    }

    const resetButton = document.createElement('button');
    resetButton.setAttribute('id', 'reset-button');
    resetButton.innerText = 'Reset';
    resetButton.addEventListener('click', () => {
        resetBoard();
    })
    belowBoard.appendChild(resetButton);
}

runBoard();

const arm = document.createElement('div');
arm.setAttribute('id', 'arm');
document.body.appendChild(arm);

let pos = true;
setInterval(() => {
    arm.style.transform = `rotate(${pos ? 45:30}deg)`;
    pos = !pos;
}, 200);

const head = document.createElement('div');
head.setAttribute('id', 'head');
document.body.appendChild(head);


const arm2 = document.createElement('div');
arm2.setAttribute('id', 'arm2');
document.body.appendChild(arm2);

const bod = document.createElement('div');
bod.setAttribute('id', 'bod');
document.body.appendChild(bod);

const speech = document.createElement('div');
speech.setAttribute('id', 'speech');
speech.innerText = 'Hi, Recurse'
document.body.appendChild(speech);
