import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

const nextMondayDate = new Date(dayjs(new Date()).day(7).add(1, 'day').format("MM DD, YYYY")).toISOString()

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

        const schedules = await prisma.patient.findMany({
            where: {
                cpf
            },
            include: {
                Scheduling: {
                    select: {
                        date: true
                    }
                }
            },
            orderBy: {
                Scheduling: {
                    date: "desc"
                }
            }

        })

        if (schedules.length && String(schedules[0].Scheduling?.date.toISOString()) >= nextMondayDate) {
            return reply.status(403).send("There is already an scheduling with this CPF.")
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

        return scheduling
    })

    app.get('/schedules-quantity', async (request, reply) => {
        const schedules = await prisma.patient.findMany({
            where: {
                Scheduling: {
                    date: {
                        gt: nextMondayDate
                    }
                }
            },
            orderBy: {
                Scheduling: {
                    date: "asc"
                }
            },
            include: {
                Scheduling: {
                    select: {
                        date: true
                    }
                }
            }
        })

        const schedulesQuantityMonday = schedules.filter(scheduling => dayjs(scheduling.Scheduling?.date).format("DD") === dayjs(nextMondayDate).format("DD"))
        const schedulesQuantityTuesday = schedules.filter(scheduling => dayjs(scheduling.Scheduling?.date).format("DD") === dayjs(nextMondayDate).day(2).format("DD"))
        const schedulesQuantityWednesday = schedules.filter(scheduling => dayjs(scheduling.Scheduling?.date).format("DD") === dayjs(nextMondayDate).day(3).format("DD"))
        const schedulesQuantityThursday = schedules.filter(scheduling => dayjs(scheduling.Scheduling?.date).format("DD") === dayjs(nextMondayDate).day(4).format("DD"))
        const schedulesQuantityFriday = schedules.filter(scheduling => dayjs(scheduling.Scheduling?.date).format("DD") === dayjs(nextMondayDate).day(5).format("DD"))

        const schedulesQuantityByWeekDay = {
            monday: {
                date: nextMondayDate,
                schedulesQuantity: schedulesQuantityMonday.length,
                schedulingTimes: schedulesQuantityMonday.length ? schedulesQuantityMonday.map(scheduling => {
                    return scheduling.Scheduling?.date
                }) : []
            },
            tuesday: {
                date: dayjs(nextMondayDate).day(2),
                schedulesQuantity: schedulesQuantityTuesday.length,
                schedulingTimes: schedulesQuantityTuesday.length ? schedulesQuantityTuesday.map(scheduling => {
                    return scheduling.Scheduling?.date
                }) : []
            },
            wednesday: {
                date: dayjs(nextMondayDate).day(3),
                schedulesQuantity: schedulesQuantityWednesday.length,
                schedulingTimes: schedulesQuantityWednesday.length ? schedulesQuantityWednesday.map(scheduling => {
                    return scheduling.Scheduling?.date
                }) : []
            },
            thursday: {
                date: dayjs(nextMondayDate).day(4),
                schedulesQuantity: schedulesQuantityThursday.length,
                schedulingTimes: schedulesQuantityThursday.length ? schedulesQuantityThursday.map(scheduling => {
                    return scheduling.Scheduling?.date
                }) : []
            },
            friday: {
                date: dayjs(nextMondayDate).day(5),
                schedulesQuantity: schedulesQuantityFriday.length,
                schedulingTimes: schedulesQuantityFriday.length ? schedulesQuantityFriday.map(scheduling => {
                    return scheduling.Scheduling?.date
                }) : []
            },
        }

        return {
            schedulesQuantityByWeekDay
        }
    })

    app.get('/scheduling', async (request, reply) => {
        const bodySchema = z.object({
            cpf: z.string()
        })

        const { cpf } = bodySchema.parse(request.query)

        const schedules = await prisma.patient.findMany({
            where: {
                cpf
            },
            include: {
                Scheduling: {
                    select: {
                        date: true
                    }
                }
            },
            orderBy: {
                Scheduling: {
                    date: "desc"
                }
            }
        })

        if (!schedules.length || String(schedules[0].Scheduling?.date.toISOString()) < nextMondayDate) {
            return reply.status(403).send("There is no scheduling with this CPF.")
        }

        return schedules[0]
    })

    app.delete('/scheduling', async (request, reply) => {
        const bodySchema = z.object({
            cpf: z.string()
        })

        const { cpf } = bodySchema.parse(request.body)

        const schedules = await prisma.patient.findMany({
            where: {
                cpf
            },
            include: {
                Scheduling: {
                    select: {
                        date: true
                    }
                }
            },
            orderBy: {
                Scheduling: {
                    date: "desc"
                }
            }
        })

        let schedulingDeleted

        if (schedules.length && String(schedules[0].Scheduling?.date.toISOString()) >= nextMondayDate) {
            schedulingDeleted = await prisma.patient.delete({
                where: {
                    id: schedules[0].id
                }
            })
        }

        if (!schedulingDeleted) {
            return reply.status(403).send("Record to delete does not exist.")
        }

        return schedulingDeleted
    })
}