import cors from 'cors'
import debug from 'debug'
import dotenv from 'dotenv'

// need to configure process.env ASAP
dotenv.config()

const CORS_ORIGIN = process.env.CORS_ORIGIN
const SERVER_PORT = parseInt(process.env.PORT || '', 10) || 3000

import express, {
  Request,
  Response,
  Application,
} from 'express'

import { addQuery } from './queue'

const corsOptions = {
  origin: CORS_ORIGIN,
  optionsSuccessStatus: 200,
}

const logInfo = debug('app:info:server')
const app: Application = express()

app.use(express.json())

if (CORS_ORIGIN) {
  logInfo(`CORS origin: '${CORS_ORIGIN}'`)
  app.use(cors(corsOptions))
}

app.post('/', async function (req: Request, res: Response) {
  const job = await addQuery(req.body)
  const result = await job.finished()

  res.send(result)
})

app.listen(SERVER_PORT, () => {
  logInfo(`Server is listening on localhost:${SERVER_PORT}`)
})
