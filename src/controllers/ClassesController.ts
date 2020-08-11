import { Request, Response } from 'express'
import db from '../database/connection'
import convertHourToMinutes from '../utils/convertHourToMinutes'

interface ScheduleItem {
    week_day: string,
    from: string,
    to: string
}

export default class ClassesController {
    async index(request: Request, response: Response) {
        const { subject, week_day, time } = request.query

        if(!subject || !week_day || !time) {
            return response.status(400).json({
                error: "Missing filters to search classes"
            })
        }

        const timeInMinutes = convertHourToMinutes(time as string)

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject as string)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*'])

        return response.json(classes)
    }

    async create(request: Request, response: Response) {
        const { 
            subject, 
            cost, 
            schedule
        } = request.body
    
        const trx = await db.transaction()
    
        try {
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id: request.body.sessionUser.id
            })
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id: insertedClassesIds[0],
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)
                }
            })
        
            await trx('class_schedule').insert(classSchedule)
        
            await trx.commit()
        
            return response.status(201).send()
        }
        catch (err) {
            console.error(err)
            await trx.rollback()
    
            return response.status(400).json({
                error: "Unexpected error while creating new class"
            })
        }
    }
}