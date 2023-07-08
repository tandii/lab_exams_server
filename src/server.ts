import fastify from 'fastify'
import { appRoutes } from './routes'

const app = fastify()

app.register(appRoutes)

app.listen({
    port: 3333,
}).then(() => console.log('Server running on port http://localhost:3333'))