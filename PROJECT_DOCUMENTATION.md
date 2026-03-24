# Project Documentation

Read this file at the beginning of each session before making changes.

## Project Overview

- Project name: `bayt-car-front`
- Stack: React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Axios, Tailwind CSS, Radix UI
- App type: Admin dashboard for the Bayt Car platform
- Main entry: [src/App.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/App.tsx)
- Backend session reference: [back-end-documentation.md](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/back-end-documentation.md)

## Local Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm.cmd run build`
- Preview: `npm run preview`

Note:
- On this machine, `npm` may be blocked by PowerShell execution policy.
- Prefer `npm.cmd ...` when running commands in PowerShell.

## Frontend Structure

Top-level folders inside `src/`:

- `components/`: shared UI and layout building blocks
- `lib/`: helpers like i18n, socket setup, upload URL resolution
- `pages/`: route-level dashboard screens
- `services/`: API wrappers built on Axios
- `store/`: Zustand stores, especially auth
- `types/`: app-wide TypeScript types

Important root files:

- [src/App.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/App.tsx): route tree
- [src/services/api.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/services/api.ts): Axios client and auth interceptors
- [src/store/authStore.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/store/authStore.ts): local auth persistence
- [src/components/layout/AdminLayout.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/layout/AdminLayout.tsx): shell layout

## Routing Map

Main dashboard routes currently include:

- `/`: dashboard
- `/users`, `/users/:id`
- `/admins`
- `/providers`, `/providers/:id`, `/providers/:id/edit`
- `/services`, `/services/:id`
- `/bookings`
- `/commissions`
- `/wallets`
- `/loyalty`
- `/commission-rules`
- `/tax`
- `/promo`, `/promo/:id`
- `/banners`
- `/splash`
- `/invoices`
- `/reports`
- `/support-tickets`
- `/admin/support-chats`
- `/admin/support-chats/:ticketId`
- `/settings`

## API and Auth Conventions

- Base API URL comes from `VITE_API_URL`, fallback `http://localhost:5000/api`
- JWT token is stored in `localStorage` under `token`
- Current user is stored in `localStorage` under `user`
- Axios request interceptor attaches `Authorization: Bearer <token>`
- Axios response interceptor redirects to `/login` on 401 for non-login requests

## Data Fetching Pattern

- TanStack Query is the default data-fetching layer
- Page and modal components usually call services directly through `useQuery` and `useMutation`
- Existing code often accepts mixed backend shapes
  - camelCase and snake_case may both appear
  - some endpoints return raw objects
  - some return wrappers like `{ data: ... }` or `{ serviceRequest: ... }`
- When adding new integrations, normalize backend response shapes inside the service layer if possible

## UI Conventions

- Existing admin UI uses cards, rounded corners, light gradients/background tinting, and spacious layouts
- Dialogs use Radix dialog primitives from [src/components/ui/dialog.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/ui/dialog.tsx)
- Shared card primitives live in [src/components/ui/card.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/ui/card.tsx)
- Keep desktop and mobile behavior in mind
- When adding substantial content inside a modal, prefer split layout on desktop and stacked layout on mobile

## Existing Chat Systems

There are two different chat-related features in this frontend. Do not confuse them.

### 1. Support Ticket Chat

Files:

- [src/services/supportChats.service.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/services/supportChats.service.ts)
- [src/pages/admins/support-chats/AdminSupportChatsPage.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/pages/admins/support-chats/AdminSupportChatsPage.tsx)
- [src/pages/admins/support-chats/AdminSupportChatDetailPage.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/pages/admins/support-chats/AdminSupportChatDetailPage.tsx)
- [src/components/support-chat/SupportChatMessages.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/support-chat/SupportChatMessages.tsx)
- [src/lib/socket.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/lib/socket.ts)

Purpose:

- Admin/customer support tickets
- Separate from service request customer-provider chat
- Uses support-ticket-specific endpoints and socket events

### 2. Service Request Customer-Provider Conversation

This is the chat tied to a `serviceRequest`.

Current frontend files:

- [src/services/serviceRequestConversation.service.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/services/serviceRequestConversation.service.ts)
- [src/components/service-request-chat/ServiceRequestConversationPanel.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/service-request-chat/ServiceRequestConversationPanel.tsx)
- [src/pages/bookings/BookingDetailsModal.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/pages/bookings/BookingDetailsModal.tsx)

Current behavior:

- The booking/service request details modal fetches the service request first
- It reads `conversationId` from the fetched service request if present
- `conversationId` can be `null`
- If `conversationId` exists, frontend fetches messages from `/chat/:conversationId/messages`
- The conversation is admin read-only inside the modal

Important product rule:

- Conversation creation is not guaranteed at service request creation time
- A service request may have no conversation yet
- The UI must handle that gracefully

Current conversation states in the modal:

- No conversation yet
- Loading conversation
- Empty conversation
- Conversation load error
- Conversation with messages

## Booking / Service Request Details Modal

Main file:

- [src/pages/bookings/BookingDetailsModal.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/pages/bookings/BookingDetailsModal.tsx)

Important notes:

- `bookingService.getBookingById()` fetches from `/service-requests/:id`
- Backend may wrap response as `{ serviceRequest: ... }`
- The modal currently uses a wider split layout
  - left: service request details
  - right: conversation panel
- The modal intentionally remains usable even if conversation loading fails

Fields currently normalized in the modal:

- `createdAt` / `created_at`
- `scheduledDate` / `scheduled_date`
- `finalPrice` / `final_agreed_price`
- `cancelReason` / `cancel_reason`
- `cancelledAt` / `cancelled_at`
- `conversationId` / `conversation_id`

## Attachments and Upload URLs

- Uploaded file URLs should be passed through [src/lib/resolveUploadUrl.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/lib/resolveUploadUrl.ts)
- The conversation panel currently supports:
  - image attachments
  - audio attachments
  - generic file links

## Known Backend Assumptions

These assumptions are currently encoded in the frontend and should be verified if backend behavior changes:

- Service request detail may include `conversationId` directly or inside a nested `conversation`
- Conversation messages endpoint is currently assumed to be `GET /chat/:conversationId/messages`
- Conversation message payload shape may vary, so frontend normalizes several wrapper formats

If the backend contract differs, update:

- [src/services/serviceRequestConversation.service.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/services/serviceRequestConversation.service.ts)

## How To Start A New Session

Recommended quick-start checklist:

1. Read this file.
2. Read [back-end-documentation.md](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/back-end-documentation.md) if the task touches backend contracts.
3. Open the route/page/service files related to the requested feature.
4. Check whether the task belongs to:
   - support ticket chat
   - service request customer-provider conversation
5. Run `npm.cmd run build` after meaningful UI or type changes.

## Recent Important Change

Recently implemented:

- Admin can now view the customer-provider conversation inside the service request details modal.

Files added for this feature:

- [src/services/serviceRequestConversation.service.ts](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/services/serviceRequestConversation.service.ts)
- [src/components/service-request-chat/ServiceRequestConversationPanel.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/components/service-request-chat/ServiceRequestConversationPanel.tsx)

Main file updated:

- [src/pages/bookings/BookingDetailsModal.tsx](c:/Users/Lenovo/Desktop/Qeema%20Tech/bayt-car-front/src/pages/bookings/BookingDetailsModal.tsx)
