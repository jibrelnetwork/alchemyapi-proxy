import WebSocket from 'ws'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import express, {
  Request,
  Response,
  Application,
} from 'express'

dotenv.config()

const queries: {
  [key: string]: void | {
    resolve: Function;
    reject: Function;
  };
} = {}

const ALCHEMY_URL = `wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY}`

const alchemy: WebSocket = new WebSocket(ALCHEMY_URL)

alchemy.on('open', function open() {
  console.log('Alchemy API websocket connection has been opened')
})

alchemy.on('message', function incoming(data: WebSocket.Data) {
  const result = JSON.parse(data.toString())

  if (!(result && result.id)) {
    return
  }

  const promise = queries[result.id]

  if (promise) {
    promise.resolve(result)
    queries[result.id] = undefined
  }
})

interface ETHRPCPayload {
  params: any[];
  jsonrpc: '2.0';
  method: string;
  id: number | string;
}

interface ETHRPCResponse {
  jsonrpc: '2.0';
  id: number | string;
  result: string | object;
}

function sendAlchemyQuery(payload: ETHRPCPayload): Promise<ETHRPCResponse> {
  const queryId = uuidv4()
  payload.id = queryId

  return new Promise((resolve, reject) => {
    queries[queryId] = {
      resolve,
      reject,
    }

    alchemy.send(JSON.stringify(payload))
  })
}

const app: Application = express()

app.use(express.json())

app.post('/', async function (req: Request, res: Response) {
  const result = await sendAlchemyQuery(req.body)

  res.send(result)
})

app.listen(3000, () => {
  console.log('Server is listening on localhost:3000')
})
