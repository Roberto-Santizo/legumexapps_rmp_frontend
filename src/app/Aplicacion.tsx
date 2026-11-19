import { Toaster } from 'sonner'
import EnrutadorApp from '@/app/router/AppRouter'

function Aplicacion() {
  return (
    <>
      <Toaster position="top-right" />
      <EnrutadorApp />
    </>
  )
}

export default Aplicacion
