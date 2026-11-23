import { useState, type FormEvent } from 'react';

import { Button, Field } from '../../components/ui';

export interface PatientRegistrationPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dateOfBirth: string;
  readonly password: string;
}

interface PatientRegistrationFormProps {
  readonly onCreateAccount: (payload: PatientRegistrationPayload) => void;
}

interface PatientRegistrationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  password?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const validateRegistration = (
  payload: PatientRegistrationPayload,
): PatientRegistrationErrors => {
  const errors: PatientRegistrationErrors = {};

  if (payload.firstName.trim() === '') {
    errors.firstName = 'Enter your legal first name.';
  }

  if (payload.lastName.trim() === '') {
    errors.lastName = 'Enter your legal last name.';
  }

  if (!emailPattern.test(payload.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (payload.dateOfBirth === '') {
    errors.dateOfBirth = 'Enter your date of birth.';
  }

  if (payload.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  }

  return errors;
};

const hasErrors = (errors: PatientRegistrationErrors): boolean =>
  Object.values(errors).some((error) => error !== undefined);

export const PatientRegistrationForm = ({
  onCreateAccount,
}: PatientRegistrationFormProps): JSX.Element => {
  const [payload, setPayload] = useState<PatientRegistrationPayload>({
    dateOfBirth: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [errors, setErrors] = useState<PatientRegistrationErrors>({});

  const updateField = (
    field: keyof PatientRegistrationPayload,
    value: string,
  ): void => {
    setPayload((currentPayload) => ({
      ...currentPayload,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextErrors = validateRegistration(payload);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    onCreateAccount({
      ...payload,
      email: payload.email.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
    });
  };

  return (
    <form className="access-form" noValidate onSubmit={handleSubmit}>
      <Field
        description="Use the name that appears on your prescription profile."
        error={errors.firstName}
        inputProps={{
          autoComplete: 'given-name',
          name: 'firstName',
          onChange: (event) => updateField('firstName', event.currentTarget.value),
          required: true,
          value: payload.firstName,
        }}
        label="First name"
      />
      <Field
        description="Use the name that appears on your prescription profile."
        error={errors.lastName}
        inputProps={{
          autoComplete: 'family-name',
          name: 'lastName',
          onChange: (event) => updateField('lastName', event.currentTarget.value),
          required: true,
          value: payload.lastName,
        }}
        label="Last name"
      />
      <Field
        description="We use this for sign-in and account recovery."
        error={errors.email}
        inputProps={{
          autoComplete: 'email',
          inputMode: 'email',
          name: 'email',
          onChange: (event) => updateField('email', event.currentTarget.value),
          required: true,
          type: 'email',
          value: payload.email,
        }}
        label="Email"
      />
      <Field
        description="Required to match your pharmacy profile."
        error={errors.dateOfBirth}
        inputProps={{
          autoComplete: 'bday',
          name: 'dateOfBirth',
          onChange: (event) => updateField('dateOfBirth', event.currentTarget.value),
          required: true,
          type: 'date',
          value: payload.dateOfBirth,
        }}
        label="Date of birth"
      />
      <Field
        description="Use at least 8 characters for this prototype."
        error={errors.password}
        inputProps={{
          autoComplete: 'new-password',
          name: 'password',
          onChange: (event) => updateField('password', event.currentTarget.value),
          required: true,
          type: 'password',
          value: payload.password,
        }}
        label="Password"
      />
      <Button type="submit" variant="primary">
        Create account
      </Button>
    </form>
  );
};
