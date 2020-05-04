import Queue from 'bull'
import debug from 'debug'

import { getWS } from './ws'

const logDebug = debug('app:debug:queue')
const QPS_LIMIT = parseInt(process.env.ALCHEMYAPI_QPS_LIMIT || '', 10)
const CONCURRENT_LIMIT = parseInt(process.env.ALCHEMYAPI_CONCURRENT_LIMIT || '', 10)

interface ETHRPCPayload {
  params: (object | string)[];
  jsonrpc: '2.0';
  method: string;
  id: number | string;
}

interface ETHRPCResponse {
  jsonrpc: '2.0';
  id: number | string;
  result: string | object;
}

interface Query {
  resolve: Function;
  reject: Function;
  originId: string | number | void;
}

interface Queries { [id: string]: Query }

const queries: Queries = {}

const requestQueue: Queue.Queue = new Queue('requestQueue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '', 10),
  },
  limiter: {
    duration: 1000,
    max: QPS_LIMIT,
    bounceBack: true,
  },
})

requestQueue.setMaxListeners(1000)

requestQueue.process(
  CONCURRENT_LIMIT,
  async (job: Queue.Job<ETHRPCPayload>,
): Promise<ETHRPCResponse> => {
  const ws = await getWS()

  return new Promise((resolve, reject) => {
    const {
      id,
      data,
    } = job

    logDebug(`Job is being processed: ${JSON.stringify(id)}`)

    ws.send(JSON.stringify({
      ...data,
      id,
    }))

    queries[id] = {
      resolve,
      reject,
      originId: data.id,
    }
  })
})

const addQuery = (payload: ETHRPCPayload): Promise<Queue.Job<ETHRPCPayload>> => {
  logDebug(`Job has been added: ${JSON.stringify(payload)}`)

  return requestQueue.add(payload, {
    attempts: 5,
    timeout: 1000 * 30,
    removeOnFail: true,
    removeOnComplete: true,
  })
}

const getQuery = (id: string): Query | void => queries[id]

const removeQuery = (id: string): void => {
  delete queries[id]
}

export {
  addQuery,
  getQuery,
  removeQuery,
}
