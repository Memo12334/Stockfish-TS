# Stockfish-TS
A wrapper for the Stockfish CLI in TypeScript.
Developed this for use in my chess bot project.

## Installation
`npm install stockfish-ts`

## Usage example
```typescript
import Stockfish from '.'

(async () => {
  const path = './stockfish'
  const stockfish = new Stockfish(path)

  stockfish.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const bestmove = await stockfish.getBestMove()
  console.log(`The best move is: ${bestmove}`)
})()
```
