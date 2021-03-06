import { RemoteAuthentication } from '@/data/usecases/authentication/remote-authentication'
import { makeAxiosAdapter } from '@/main/factories/http/axios-adapter-factory'
import { makeApiUrl } from '@/main/factories/http/api-url-factory'
import { Authentication } from '@/domain/usecases'

export const makeRemoteAuthentication = (): Authentication => {
  return new RemoteAuthentication(makeApiUrl('/login'), makeAxiosAdapter())
}
