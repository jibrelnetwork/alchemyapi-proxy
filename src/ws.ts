import debug from 'debug'
import WebSocket from 'ws'

import {
  getQuery,
  removeQuery,
} from './queue'

const logInfo = debug('app:info:ws')
const logDebug = debug('app:debug:ws')
const logError = debug('app:error:ws')
const WS_RECONNECT_INTERVAL = 1000 * 5
const API_PROVIDER_URL = `wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY}`

let ws: WebSocket | null = null
const checkConnectionOpen = (): boolean => !!ws && (ws.readyState === ws.OPEN)

const onOpen = (): void => {
  logInfo('API websocket connection has been opened')
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

const connect = (): void => {
  const instance = new WebSocket(API_PROVIDER_URL)

  instance.on('open', onOpen)
  instance.on('message', onMessage)
  instance.on('error', onError)
  instance.on('close', onClose)

  ws = instance
}

const reconnect = (): void => {
  if (!(ws && checkConnectionOpen())) {
    return
  }

  ws.removeAllListeners()
  ws.close()

  setTimeout(connect, WS_RECONNECT_INTERVAL)
}

connect()

const getWS = (): WebSocket | null => {
  if (!checkConnectionOpen()) {
    return null
  }

  return ws
}

export { getWS }
