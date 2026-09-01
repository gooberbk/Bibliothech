import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret || '')

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error occurred', {
        status: 400,
      })
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created') {
      await handleUserCreated(evt.data)
    } else if (eventType === 'user.updated') {
      await handleUserUpdated(evt.data)
    } else if (eventType === 'user.deleted') {
      await handleUserDeleted(evt.data)
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data

  const email = email_addresses[0]?.email_address
  const name = [first_name, last_name].filter(Boolean).join(' ') || null

  try {
    await db.user.create({
      data: {
        clerkId: id,
        email,
        name,
        image: image_url,
        role: 'USER',
        lastSyncAt: new Date(),
      },
    })
    console.log(`User created: ${id}`)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data

  const email = email_addresses[0]?.email_address
  const name = [first_name, last_name].filter(Boolean).join(' ') || null

  try {
    await db.user.update({
      where: { clerkId: id },
      data: {
        email,
        name,
        image: image_url,
        lastSyncAt: new Date(),
      },
    })
    console.log(`User updated: ${id}`)
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(data: any) {
  const { id } = data

  try {
    await db.user.delete({
      where: { clerkId: id },
    })
    console.log(`User deleted: ${id}`)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}
