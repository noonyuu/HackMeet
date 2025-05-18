import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/nfc/$eventId/$workId/')({
  component: RouteComponent,
})

function RouteComponent() {
  // const { eventId, workId } = useParams()
  
  // const GET_NFC_DATA = gql`
  //   query `

  return <div>Hello "/nfc/$eventId/$workId/"!</div>
}
