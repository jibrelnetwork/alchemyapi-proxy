# alchemyapi-proxy
Proxy server for alchemyapi.io with the rate limit management

## Development
### Prerequisites
#### Redis
The app uses redis for queue management.

Install redis with the help of brew:
```
brew update
brew install redis
```
To have launchd start redis now and restart at login:
```
brew services start redis
```
Location of Redis configuration file.
```
/usr/local/etc/redis.conf
```

### Npm
Then you are ready to setup the project npm dependencies
```
npm i
npm run dev
```

## Environment
For environment variables it is necessary to create `.env` file in the root dir:
```
PORT=<api server port (default: 3000)>
CORS_ORIGIN=<CORS origin (can be omitted for development)>
ALCHEMYAPI_CONCURRENT_LIMIT=<concurrent requests>
ALCHEMYAPI_QPS_LIMIT=<requests per second>
ALCHEMYAPI_KEY=<a key for accessing of the alchemyapi.io>
REDIS_HOST=<redis host>
REDIS_PORT=<redis port>
REDIS_PASSWORD=<redis password>
```
