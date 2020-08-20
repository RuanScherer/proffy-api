import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
const authConfig = require('../config/auth.json')

module.exports = (request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization

    if (!authHeader) return response.status(401).send()

    try {
        const payload = jwt.verify(authHeader, authConfig.appKey)
        request.body.sessionUser = payload
        next()
    }
    catch (err) {
        console.error(err)
        return response.status(401).send()
    }
}