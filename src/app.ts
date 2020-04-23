import dotenv from 'dotenv'
import request from 'request-promise'

import express, {
  Response,
  Application,
} from 'express'

dotenv.config()

const ALCHEMY_BASE_URL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY}`

const app: Application = express()

app.post('/eth_blockNumber', async function (_, res: Response) {
  const result = await request({
    method: 'POST',
    uri: ALCHEMY_BASE_URL,
    body: {
      'jsonrpc': "2.0",
      'method': "eth_blockNumber",
      'params': [],
      'id': 83,
    },
    json: true,
  })

  res.send(result)
})

app.listen(3000)
