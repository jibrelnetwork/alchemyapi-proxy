import debug from 'debug'
import dotenv from 'dotenv'

// need to configure process.env ASAP
dotenv.config()

const logInfo = debug('app:info:server')

import express, {
  Request,
  Response,
  Application,
} from 'express'

import { getWS } from './ws'
import { addQuery } from './queue'

const app: Application = express()

app.use(express.json())

app.post('/', async function (req: Request, res: Response) {
  if (!getWS()) {
    res.sendStatus(500)

    return
  }

  const job = await addQuery(req.body)
  const result = await job.finished()

  res.send(result)
})

app.listen(3000, () => {
  logInfo('Server is listening on localhost:3000')
})
