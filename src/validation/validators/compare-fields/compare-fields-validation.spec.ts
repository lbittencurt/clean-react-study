import { CompareFieldsValidation } from './compare-fields-validation'
import { InvalidFieldError } from '@/validation/errors'

import faker from 'faker'

const fieldValue = faker.database.column()
const makeSut = (valueToCompare: string): CompareFieldsValidation => new CompareFieldsValidation(fieldValue, valueToCompare)

describe('CompareFieldsValidation', () => {
  test('should return error if compare is invalid', () => {
    const sut = makeSut(faker.random.word())
    const error = sut.validate(faker.random.word())
    expect(error).toEqual(new InvalidFieldError())
  })
})
