exports.checkBingo = (board, completedNumbers) => {
  let c = 0;
  for (let i = 0; i < 5; i++) {
    const row = board[i];
    const isBingo = row.every((cell) => completedNumbers.includes(cell));
    if (isBingo) {
      c = c + 1;
    }
  }

  for (let j = 0; j < 5; j++) {
    const col = board.map((row) => row[j]);
    const isBingo = col.every((cell) => completedNumbers.includes(cell));
    if (isBingo) {
      c = c + 1;
    }
  }

  const diagonal1 = board.map((row, i) => row[i]);
  const diagonal1Bingo = diagonal1.every((cell) =>
    completedNumbers.includes(cell),
  );
  if (diagonal1Bingo) {
    c = c + 1;
  }

  const diagonal2 = board.map((row, i) => row[board.length - 1 - i]);
  const isDiagonal2Bingo = diagonal2.every((cell) =>
    completedNumbers.includes(cell),
  );
  if (isDiagonal2Bingo) {
    c = c + 1;
  }

  if (c == 5) {
    return true;
  }
  return false;
};
