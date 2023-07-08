import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";

export async function appRoutes(app: FastifyInstance) {
    app.post('/scheduling', async (request, reply) => {
        const bodySchema = z.object({
            name: z.string(),
            cpf: z.string(),
            bloodGroup: z.string(),
            gender: z.string(),
            phone: z.string(),
            date: z.coerce.date()
        })

        const { name, cpf, bloodGroup, gender, phone, date } = bodySchema.parse(request.body)

        const user = await prisma.patient.findUnique({
            where: {
                cpf
            }
        })

        if (user) {
            reply.status(403).send('You already have an appointment.')
        }

        const scheduling = await prisma.patient.create({
            data: {
                name,
                cpf,
                bloodGroup,
                gender,
                phone,
                Scheduling: {
                    create: {
                        date
                    }
                }
            }
        })

        return {
            scheduling
        }
    })

    app.get('/scheduling', async (request, reply) => {
        const schedules = await prisma.patient.findMany({
            include: {
                Scheduling: {
                    select: {
                        date: true
                    }
                }
            }
        })

        console.log(schedules)

        return schedules
    })
}