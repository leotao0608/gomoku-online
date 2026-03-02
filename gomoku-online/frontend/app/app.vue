<template>
  <div>
    <h1>Gomoku Online</h1>
    <div v-if="!gameId" style="padding: 20px; color: red;">
      Loading game...
    </div>
    <div v-else style="padding: 10px; background: #eee;">
      Game ID: {{ gameId }}
    </div>
    <div v-if="gameId" class="board">
      <div v-for="i in 15" :key="i">
        <div v-for="j in 15" :key="j" class="cell" :id="`${i},${j}`" @click="handleClick(i-1, j-1)">
          <div v-if="board[i-1][j-1] === 1" class="black piece"></div>
          <div v-if="board[i-1][j-1] === -1" class="white piece"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';

let gameId = ref('');
onMounted(async () => {
  try {
    const response = await fetch('/api/game/create', { method: 'POST' });
    if (!response.ok) {
      alert(`Failed to create game: ${response.status}`);
      return;
    }
    const data = await response.json();
    if (data.gameId) {
      gameId.value = data.gameId;
      console.log('Game created:', gameId.value);
    } else {
      alert('Failed to create game');
    }
  } catch (err) {
    alert(`Error creating game: ${err.message}`);
  }
});
const size = 15;
let board = reactive(
  Array.from({ length: size }, () =>
    Array(size).fill(0)
  )
)
async function playerMove(x, y) {
  if (!gameId.value) {
    alert('Game not ready yet. Please wait for game creation to complete.');
    return;
  }

  try {
    const response = await fetch(`/api/game/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: gameId.value, x, y })
    });

    if (!response.ok) {
      alert(`Server error: ${response.status}`);
      return;
    }

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.board) {
      data.board.forEach((row, i) => {
        board[i] = row;
      });
    }

    if (data.message) {
      alert(data.message);
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}


function handleClick(i, j){
  if(board[i][j] === 0){
    playerMove(i, j);
  }
}
</script>
<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(15, 30px);
  grid-template-rows: repeat(15, 30px);
  gap: 0; 
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid black;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5d6a0;
}

.piece {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.black {
  background-color: black;
}

.white {
  background-color: white;
  border: 1px solid black;
}
</style>