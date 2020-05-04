import debug from 'debug'
import WebSocket from 'ws'
import BluebirdPromise from 'bluebird'

import {
  getQuery,
  removeQuery,
} from './queue'

const logInfo = debug('app:info:ws')
const logDebug = debug('app:debug:ws')
const logError = debug('app:error:ws')

const ONE_SECOND = 1000
const WS_PING_INTERVAL = 30 * ONE_SECOND
const WS_CONNECT_INTERVAL = 5 * ONE_SECOND
const API_PROVIDER_URL = `wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY}`

let ws: WebSocket | null = null
let pingIntervalId: NodeJS.Timeout | null = null

const onOpen = (): void => {
  logInfo('API websocket connection has been opened')
  pingIntervalId = setInterval(() => ws?.ping(), WS_PING_INTERVAL)
}

const onPing = (): void => {
  ws?.pong()
}

const onMessage = (data: WebSocket.Data): void => {
  try {
    const result = JSON.parse(data.toString())

    if (!(result && result.id)) {
      throw new Error(`Got invalid response: ${data}`)
    }

    const query = getQuery(result.id)

    logDebug(`Got message: ${data}`)

    if (query) {
      query.resolve({
        ...result,
        id: query.originId || result.id,
      })
    }

    removeQuery(result.id)
  } catch (error) {
    logError(error)
    logError(`Invalid message format: ${data}`)
  }
}

const onError = (err: Error): void => {
  logError(err)
}

const onClose = (code: number, reason: string): void => {
  logError(`WebSocket connection has been accidentally closed with code ${code}`)
  logError(reason)

  // eslint-disable-next-line
  reconnect()
}

const waitConnection = async (): Promise<WebSocket> => {
  if (ws) {
    if ((ws.readyState === ws.OPEN)) {
      return ws
    } else if (ws.readyState === ws.CONNECTING) {
      logDebug('WebSocket is waiting for establishing the connection')

      return BluebirdPromise.delay(500).then(waitConnection)
    }
  }

  throw new Error('Connecting attempt to WebSocket server has been failed')
}

const connect = async (): Promise<WebSocket> => {
  logDebug('WebSocket is going to establish new connection')

  if (ws && (ws.readyState === ws.CONNECTING)) {
    return waitConnection()
  }

  ws = null
  const instance = new WebSocket(API_PROVIDER_URL)

  instance.on('open', onOpen)
  instance.on('ping', onPing)
  instance.on('message', onMessage)
  instance.on('error', onError)
  instance.on('close', onClose)

  ws = instance

  return waitConnection()
}

const reconnect = async (): Promise<WebSocket> => {
  logDebug('WebSocket is going to reconnect')

  if (pingIntervalId !== null) {
    clearInterval(pingIntervalId)
  }

  // soft clean of instance before shutdown
  if (ws) {
    ws.removeAllListeners()
    ws.close()
  }

  return BluebirdPromise.delay(WS_CONNECT_INTERVAL).then(connect)
}

connect()

const getWS = async (): Promise<WebSocket> => {
  if (ws && (ws.readyState === ws.OPEN)) {
    return ws
  }

  // just wait, it should be resolved once 'close' event is happened
  return waitConnection()
}

export { getWS }
