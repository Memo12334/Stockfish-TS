import { spawn } from 'child_process'
import { Options } from './types/Options'

export default class Stockfish {
  private stockfish

  constructor(path: string) {
    this.stockfish = spawn(path)
  }

  public send(command: string) {
    if (this.stockfish.stdin.writable) {
      this.stockfish.stdin.write(command + '\n')
    }
    else {
      throw new Error('Stockfish: stdin is not writable')
    }
  }

  /**
   * Set option.
   * 
   * @param name Option name.
   * @param value Option value.
   */
  public async setOption(option: Options, value: string) {
    this.send(`setoption name ${option} value ${value}`)
    if (!(await this.isReady())) {
      throw new Error('Stockfish: setoption failed')
    }
  }

  /**
    * Set position by Forsyth-Edwards Notation (FEN).
    * 
    * @param fen Forsyth-Edwards Notation (FEN) string.
   */
  public setFen(fen: string) {
    this.send(`position fen ${fen}`)
  }

  /**
   * Start new game
   */
  public async newGame() {
    this.send('ucinewgame')
    if (!(await this.isReady())) {
      throw new Error('Stockfish: ucinewgame failed')
    }
  }

  private isReady() {
    this.send('isready')

    return new Promise((resolve, reject) => {
      this.stockfish.stdout.on('readable', () => {
        let chunk
        while (null !== (chunk = this.stockfish.stdout.read())) {
          if (chunk.toString().includes('readyok')) {
            return resolve(true)
          }
        }
      })

      this.stockfish.stderr.on('error', (error) => {
        return reject(error.toString())
      })
    }).finally(() => {
      this.stockfish.stdout.removeAllListeners()
    })
  }

  /**
   * Set start position.
   * 
   * @param pos Position string.
   */
  public setStartPosition(pos: string = 'startpos') {
    this.send(`position ${pos}`)
  }

  private go(time: number = 1000) {
    this.send(`go movetime ${time}`)
  }

  /**
    * Start calculating the best move for the current position and return it.
    * 
    * @param time Time in milliseconds.
   */
  public getBestMove(time: number = 1000) {
    this.go(time)

    return new Promise((resolve, reject) => {
      this.stockfish.stdout.on('readable', () => {
        let chunk
        while (null !== (chunk = this.stockfish.stdout.read())) {
          if (chunk.toString().includes('bestmove')) {
            const data = chunk.toString().split('\n')
            const bestmove = data[data.length - 2].split(' ')[1]
            return resolve(bestmove)
          }
        }
      })

      this.stockfish.stderr.on('error', (error) => {
        return reject(error.toString())
      })
    }).finally(() => {
      this.stockfish.stdout.removeAllListeners()
    })
  }
}
