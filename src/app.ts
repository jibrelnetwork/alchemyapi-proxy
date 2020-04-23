import express, {
  Response,
  Application,
} from 'express'

const app: Application = express()

app.get('/', function (_, res: Response) {
  res.send('Hello World')
})

app.listen(3000)
