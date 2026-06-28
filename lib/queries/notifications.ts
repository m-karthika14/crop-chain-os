import { query, queryOne } from '../db'
import type { Notification } from '../types'

export async function getNotifications(
  user_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Notification[]; unread: number }> {
  const rows = await query<Notification>(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  )
  const unreadRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND read = false`,
    [user_id]
  )
  return { rows, unread: parseInt(unreadRow?.count ?? '0') }
}

export async function markNotificationRead(id: string, user_id: string): Promise<void> {
  await query(
    `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  )
}

export async function markAllNotificationsRead(user_id: string): Promise<void> {
  await query(
    `UPDATE notifications SET read = true WHERE user_id = $1`,
    [user_id]
  )
}

export async function createNotification(
  data: Omit<Notification, 'id' | 'created_at'>
): Promise<Notification> {
  const row = await queryOne<Notification>(
    `INSERT INTO notifications (user_id, title, message, type, read, link)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [data.user_id, data.title, data.message, data.type, data.read, data.link]
  )
  return row!
}
