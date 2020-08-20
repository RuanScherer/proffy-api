import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database/connection'
const authConfig = require('../config/auth.json')

interface User {
    id: number,
    name: string,
    email: string,
    avatar?: string
}

function generateToken(params: User) {
    return jwt.sign(params, authConfig.appKey, { expiresIn: 86400 })
}

export default class UsersController {
    async show(request: Request, response: Response) {
        const { id } = request.params
        if (!id) return response.status(400).send()

        const users = await db('users').select('*').where('id', '=', id)

        if (!users) return response.status(400).send()
        return response.send({ user: users[0] })
    }

    async create(request: Request, response: Response) {
        const { name, email, password } = request.body

        if (!name || !email || !password) return response.status(400).send()

        const hash = await bcrypt.hash(password, 10)
        db('users')
            .insert({ name, email, password: hash })
            .then(ids => {
                return response.send({ 
                    token: generateToken({ 
                        id: ids[0], 
                        name, 
                        email
                    })
                })
            })
            .catch(err => {
                return response.status(500).send({ err })
            })
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body

        if (!email || !password) return response.status(400).send()

        db().select()
            .table('users')
            .where('email', email)
            .then(async users => {
                if (users.length > 0 && await bcrypt.compare(password, users[0].password)) {
                    const user = users[0]
                    const token = generateToken({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar
                    })
                    return response.send({ token })
                }
                return response.status(400).send()
            })
            .catch(err => {
                return response.status(500).send({ err })
            })
    }

    async update(request: Request, response: Response) {
        const { name, email, avatar, whatsapp, bio } = request.body
        const { id } = request.params
        if (!id) return response.status(400).send()

        if (!name && !email && !avatar && !whatsapp && !bio) return response.status(400).send()

        db('users')
            .where('id', '=', id)
            .update({ name, email, avatar, whatsapp, bio })
            .then(id => {
                return response.send({ 
                    token: generateToken({ 
                        id: id, 
                        name, 
                        email
                    })
                })
            })
            .catch(err => {
                return response.status(500).send({ err })
            })
    }
}