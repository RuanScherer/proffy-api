import express from 'express'
import ClassesController from './controllers/ClassesController'
import ConnectionsController from './controllers/ConnectionsController'
import UsersController from './controllers/UsersController'
const authMiddleware = require('./middlewares/auth')

const routes = express.Router()

const usersController = new UsersController()
const classesController = new ClassesController()
const connectionsController = new ConnectionsController()

routes.post('/users', usersController.create)
routes.post('/users/auth', usersController.login)

routes.use(authMiddleware)

routes.put('/users/:id', usersController.update)
routes.get('/users/:id', usersController.show)
routes.get('/classes', classesController.index)
routes.post('/classes', classesController.create)
routes.get('/connections', connectionsController.index)
routes.post('/connections', connectionsController.create)

export default routes