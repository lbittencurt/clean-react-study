import { AxiosAdapter } from './axios-adapter'
import { mockPostRequest } from '@/data/test'
import { mockAxios, mockHttpResponse } from '@/infra/test'

import axios from 'axios'

jest.mock('axios')

type SutTypes = {
  sut: AxiosAdapter
  mockedAxios: jest.Mocked<typeof axios>
}

const makeSut = (): SutTypes => {
  const sut = new AxiosAdapter()
  const mockedAxios = mockAxios()
  return { sut, mockedAxios }
}

describe('AxiosAdapter', () => {
  test('should call axios with correct values', async () => {
    const request = mockPostRequest()
    const { sut, mockedAxios } = makeSut()
    await sut.post(request)
    expect(mockedAxios.post).toHaveBeenCalledWith(request.url, request.body)
  })

  test('should return the correct statusCode and body', () => {
    const { sut, mockedAxios } = makeSut()
    const response = sut.post(mockPostRequest())
    expect(response).toEqual(mockedAxios.post.mock.results[0].value)
  })

  test('should return the correct statusCode and body on failure', () => {
    const { sut, mockedAxios } = makeSut()
    mockedAxios.post.mockRejectedValueOnce({
      response: mockHttpResponse()
    })
    const response = sut.post(mockPostRequest())
    expect(response).toEqual(mockedAxios.post.mock.results[0].value)
  })
})
