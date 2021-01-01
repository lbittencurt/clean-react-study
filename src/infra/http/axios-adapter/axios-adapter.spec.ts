import { AxiosAdapter } from './axios-adapter'
import axios from 'axios'
import faker from 'faker'
import { HttpPostParams } from '@/data/protocols/http'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedAxiosResponse = {
  data: faker.random.objectElement,
  status: faker.random.number
}

mockedAxios.post.mockResolvedValue(mockedAxiosResponse)

const makeSut = (): AxiosAdapter => {
  return new AxiosAdapter()
}

const mockPostRequest = (): HttpPostParams<any> => ({
  url: faker.internet.url(),
  body: faker.random.objectElement()
})

describe('AxiosAdapter', () => {
  test('should call axios with correct values', async () => {
    const request = mockPostRequest()
    const sut = makeSut()
    await sut.post(request)
    expect(mockedAxios.post).toHaveBeenCalledWith(request.url, request.body)
  })

  test('should return the correct statusCode and body', async () => {
    const sut = makeSut()
    const response = await sut.post(mockPostRequest())
    expect(response).toEqual({
      statusCode: mockedAxiosResponse.status,
      body: mockedAxiosResponse.data
    })
  })
})
