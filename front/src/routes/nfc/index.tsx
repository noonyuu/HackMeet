import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nfc/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/nfc/"!</div>
}
