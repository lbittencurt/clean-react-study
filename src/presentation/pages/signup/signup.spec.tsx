import React from 'react'
import { cleanup, fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import faker from 'faker'
import { SignUp } from '..'
import { AddAccountSpy, Helper, SaveAccessTokenMock, ValidationStub } from '@/presentation/test'
import { EmailInUseError } from '@/domain/erros'

type SutTypes = {
  sut: RenderResult
  addAccountSpy: AddAccountSpy
  saveAccessTokenMock: SaveAccessTokenMock
}
type SutParams = {
  validationError: string
}

const history = createMemoryHistory({ initialEntries: ['/signup'] })

const makeSut = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub()
  validationStub.errorMessage = params?.validationError
  const addAccountSpy = new AddAccountSpy()
  const saveAccessTokenMock = new SaveAccessTokenMock()
  const sut = render(
    <Router history={history}>
      <SignUp validation={validationStub} addAccount={addAccountSpy} saveAccessToken={saveAccessTokenMock} />
    </Router>
  )
  return { sut, addAccountSpy, saveAccessTokenMock }
}

const simulateValidSubmit = async (
  sut: RenderResult,
  name = faker.name.findName(),
  email = faker.internet.email(),
  password = faker.internet.password()
): Promise<void> => {
  Helper.populateField(sut, 'name', name)
  Helper.populateField(sut, 'email', email)
  Helper.populateField(sut, 'password', password)
  Helper.populateField(sut, 'passwordConfirmation', password)
  const form = sut.getByTestId('form')
  fireEvent.submit(form)
  await waitFor(() => form)
}

describe('Signup Component', () => {
  afterEach(cleanup)

  test('should start with initial state', () => {
    const validationError = faker.random.word()
    const { sut } = makeSut({ validationError })
    Helper.testChildCount(sut, 'error-wrap', 0)
    Helper.testButtonIsDisabled(sut, 'submit', true)
    Helper.testStatusForField(sut, 'name', validationError)
    Helper.testStatusForField(sut, 'email', validationError)
    Helper.testStatusForField(sut, 'password', validationError)
    Helper.testStatusForField(sut, 'passwordConfirmation', validationError)
  })

  test('should show name error if validation fails', () => {
    const validationError = faker.random.word()
    const { sut } = makeSut({ validationError })

    Helper.populateField(sut, 'name')
    Helper.testStatusForField(sut, 'name', validationError)
  })

  test('should show email error if validation fails', () => {
    const validationError = faker.random.word()
    const { sut } = makeSut({ validationError })

    Helper.populateField(sut, 'email')
    Helper.testStatusForField(sut, 'email', validationError)
  })

  test('should show password error if validation fails', () => {
    const validationError = faker.random.word()
    const { sut } = makeSut({ validationError })

    Helper.populateField(sut, 'password')
    Helper.testStatusForField(sut, 'password', validationError)
  })

  test('should show passwordConfirmation error if validation fails', () => {
    const validationError = faker.random.word()
    const { sut } = makeSut({ validationError })

    Helper.populateField(sut, 'passwordConfirmation')
    Helper.testStatusForField(sut, 'passwordConfirmation', validationError)
  })

  test('should show valid name state if Validation succeeds', () => {
    const { sut } = makeSut()
    Helper.populateField(sut, 'name')
    Helper.testStatusForField(sut, 'name')
  })

  test('should show valid email state if Validation succeeds', () => {
    const { sut } = makeSut()
    Helper.populateField(sut, 'email')
    Helper.testStatusForField(sut, 'email')
  })

  test('should show valid password state if Validation succeeds', () => {
    const { sut } = makeSut()
    Helper.populateField(sut, 'password')
    Helper.testStatusForField(sut, 'password')
  })

  test('should show valid passwordConfirmation state if Validation succeeds', () => {
    const { sut } = makeSut()
    Helper.populateField(sut, 'passwordConfirmation')
    Helper.testStatusForField(sut, 'passwordConfirmation')
  })

  test('should enable submit button if form is valid', () => {
    const { sut } = makeSut()
    Helper.populateField(sut, 'name')
    Helper.populateField(sut, 'email')
    Helper.populateField(sut, 'password')
    Helper.populateField(sut, 'passwordConfirmation')
    Helper.testButtonIsDisabled(sut, 'submit', false)
  })

  test('should show spinner on submit', async () => {
    const { sut } = makeSut()
    await simulateValidSubmit(sut)
    Helper.testElementExists(sut, 'spinner')
  })

  test('should call AddAccount with correct values', async () => {
    const { sut, addAccountSpy } = makeSut()
    const name: string = faker.name.findName()
    const email: string = faker.internet.email()
    const password: string = faker.internet.email()

    await simulateValidSubmit(sut, name, email, password)

    expect(addAccountSpy.params).toEqual({
      name,
      email,
      password,
      passwordConfirmation: password
    })
  })

  test('should call AddAccount only once', async () => {
    const { sut, addAccountSpy } = makeSut()
    await simulateValidSubmit(sut)
    await simulateValidSubmit(sut)
    expect(addAccountSpy.callsCount).toBe(1)
  })

  test('Should not call AddAccount if form is invalid', async () => {
    const validationError = faker.random.word()
    const { sut, addAccountSpy } = makeSut({ validationError })
    await simulateValidSubmit(sut)
    expect(addAccountSpy.callsCount).toBe(0)
  })

  test('should present error if authentication fails', async () => {
    const { sut, addAccountSpy } = makeSut()
    const error = new EmailInUseError()

    jest.spyOn(addAccountSpy, 'add').mockRejectedValue(error)

    await simulateValidSubmit(sut)

    Helper.testChildCount(sut, 'error-wrap', 1)
    Helper.testElementText(sut, 'main-error', error.message)
  })

  test('should call SaveAccessToken on sucesss', async () => {
    const { sut, addAccountSpy, saveAccessTokenMock } = makeSut()
    await simulateValidSubmit(sut)
    expect(saveAccessTokenMock.accessToken).toBe(addAccountSpy.account.accessToken)
    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/')
  })

  test('should present error if SaveAccessToken fails', async () => {
    const { sut, saveAccessTokenMock } = makeSut()
    const error = new EmailInUseError()
    jest.spyOn(saveAccessTokenMock, 'save').mockRejectedValue(error)
    await simulateValidSubmit(sut)
    Helper.testChildCount(sut, 'error-wrap', 1)
    Helper.testElementText(sut, 'main-error', error.message)
  })

  test('should go to login page', () => {
    const { sut } = makeSut()
    const loginLink = sut.getByTestId('login-link')
    fireEvent.click(loginLink)

    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/login')
  })
})
