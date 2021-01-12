import { AxiosAdapter } from '@/infra/http/axios-adapter/axios-adapter'

export const makeAxiosAdapter = (): AxiosAdapter => {
  return new AxiosAdapter()
}
