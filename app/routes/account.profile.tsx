import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {Field} from '~/components/Field';
import type {Route} from './+types/account.profile';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile | Saqr'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <section className="account-section">
      <h2 className="account-section-title">Profile</h2>
      <Form method="PUT" className="account-form">
        <fieldset className="account-fieldset">
          <legend className="sr-only">Personal information</legend>
          <div className="field-row">
            <Field label="First name">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
              />
            </Field>
            <Field label="Last name">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
              />
            </Field>
          </div>
        </fieldset>
        {action?.error ? (
          <p className="form-error" role="alert">
            {action.error}
          </p>
        ) : null}
        <button type="submit" className="button" disabled={state !== 'idle'}>
          {state !== 'idle' ? 'Saving…' : 'Save changes'}
        </button>
      </Form>
    </section>
  );
}
