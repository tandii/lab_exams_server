import fastify from 'fastify'
import { appRoutes } from './routes'
import cors from '@fastify/cors'

const app = fastify()

app.register(cors, {
    origin: true
})

app.register(appRoutes)

app.listen({
    port: 3333,
}).then(() => console.log('Server running on port http://localhost:3333'))