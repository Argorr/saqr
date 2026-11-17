import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import {Field} from '~/components/Field';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses | Saqr'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <section className="account-section">
      <h2 className="account-section-title">Addresses</h2>
      {addresses.nodes.length ? (
        <ExistingAddresses
          addresses={addresses}
          defaultAddress={defaultAddress}
        />
      ) : (
        <p className="page-empty">You have no saved addresses.</p>
      )}
      <details className="account-disclosure" open={!addresses.nodes.length}>
        <summary className="button button-ghost">Add an address</summary>
        <NewAddressForm key={addresses.nodes.length} />
      </details>
    </section>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="form-actions">
          <button
            className="button"
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? 'Saving…' : 'Save address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <ul className="address-list">
      {addresses.nodes.map((address) => (
        <li key={address.id} className="address-card">
          <details>
            <summary className="address-summary">
              <address>
                {address.formatted.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              {defaultAddress?.id === address.id ? (
                <span className="address-default">Default</span>
              ) : null}
              <span className="address-edit">Edit</span>
            </summary>
            <AddressForm
              addressId={address.id}
              address={address}
              defaultAddress={defaultAddress}
            >
              {({stateForMethod}) => (
                <div className="form-actions">
                  <button
                    className="button"
                    disabled={stateForMethod('PUT') !== 'idle'}
                    formMethod="PUT"
                    type="submit"
                  >
                    {stateForMethod('PUT') !== 'idle' ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    className="button button-ghost"
                    disabled={stateForMethod('DELETE') !== 'idle'}
                    formMethod="DELETE"
                    type="submit"
                  >
                    {stateForMethod('DELETE') !== 'idle'
                      ? 'Deleting…'
                      : 'Delete'}
                  </button>
                </div>
              )}
            </AddressForm>
          </details>
        </li>
      ))}
    </ul>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId} className="account-form">
      <fieldset className="account-fieldset">
        <legend className="sr-only">Address</legend>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="field-row">
          <Field label="First name" required>
            <input
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              name="firstName"
              required
              type="text"
            />
          </Field>
          <Field label="Last name" required>
            <input
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              name="lastName"
              required
              type="text"
            />
          </Field>
        </div>
        <Field label="Company">
          <input
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            name="company"
            type="text"
          />
        </Field>
        <Field label="Address" required>
          <input
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            name="address1"
            required
            type="text"
          />
        </Field>
        <Field label="Address line 2">
          <input
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            name="address2"
            type="text"
          />
        </Field>
        <div className="field-row">
          <Field label="City" required>
            <input
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              name="city"
              required
              type="text"
            />
          </Field>
          <Field label="Postcode" required>
            <input
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              name="zip"
              required
              type="text"
            />
          </Field>
        </div>
        <div className="field-row">
          <Field label="State / region" required>
            <input
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              name="zoneCode"
              required
              type="text"
            />
          </Field>
          <Field label="Country code" required>
            <input
              autoComplete="country"
              defaultValue={address?.territoryCode ?? ''}
              name="territoryCode"
              required
              type="text"
              maxLength={2}
              placeholder="FR"
            />
          </Field>
        </div>
        <Field label="Phone">
          <input
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            name="phoneNumber"
            type="tel"
            pattern="^\+?[1-9]\d{3,14}$"
            placeholder="+33612345678"
          />
        </Field>
        <label className="field-check">
          <input
            defaultChecked={isDefaultAddress}
            name="defaultAddress"
            type="checkbox"
          />
          Use as my default address
        </label>
      </fieldset>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}
