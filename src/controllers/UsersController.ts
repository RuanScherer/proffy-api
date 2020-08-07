import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../database/connection'

export default class UsersController {
    async create(request: Request, response: Response) {
        const { name, email, password } = request.body

        if (!name || !email || !password) return response.status(400).send()

        const hash = await bcrypt.hash(password, 10)
        db('users')
            .insert({ name, email, password: hash })
            .then(() => {
                return response.status(201).send()
            })
            .catch(() => {
                return response.status(500).send()
            })
    }
}