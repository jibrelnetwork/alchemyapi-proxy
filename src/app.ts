import dotenv from 'dotenv'
import request from 'request-promise'

import express, {
  Request,
  Response,
  Application,
} from 'express'

dotenv.config()

const ALCHEMY_BASE_URL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY}`

const app: Application = express()

app.use(express.json())

app.post('/', async function (req: Request, res: Response) {
  const result = await request({
    method: 'POST',
    uri: ALCHEMY_BASE_URL,
    body: req.body,
    json: true,
  })

  res.send(result)
})

app.listen(3000)
