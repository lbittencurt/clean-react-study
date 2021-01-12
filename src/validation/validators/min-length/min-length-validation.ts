import { InvalidFieldError } from '@/validation/errors'
import { FieldValidation } from '@/validation/protocols'

export class MinLengthValidation implements FieldValidation {
  fieldName: string

  constructor (readonly field: string, private readonly minLength: number) {}

  validate (value: string): Error {
    return new InvalidFieldError()
  }
}
