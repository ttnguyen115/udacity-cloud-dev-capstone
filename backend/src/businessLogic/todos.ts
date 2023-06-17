import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()
const logger = createLogger('businessLogic')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}

export const createTodo = async (
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const todoId = uuid.v4()
  return todosAccess.createTodoItem(userId, todoId, newTodo)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<TodoUpdate> {
  return await todosAccess.updateTodoItem(todoId, userId, updatedTodo)
}

export async function deleteTodo(userId: string, todoId: string) {
  await todosAccess.deleteTodoItem(todoId, userId)
  return true
}

export async function searchTodo(key: string, userId: string): Promise<TodoItem[]> {
  return await todosAccess.searchTodo(key, userId)
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  await todosAccess.updateTodoAttachmentUrl(todoId, userId)
  const presignedUrl = attachmentUtils.getUploadUrl(todoId)
  logger.info('Created presignedUrl', { presignedUrl })
  return presignedUrl
}
