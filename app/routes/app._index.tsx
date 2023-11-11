import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, useSubmit, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  VerticalStack,
  EmptyState,
  Card,
  Button,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getLatest } from "~/models/Latest.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  //await authenticate.admin(request);

  const latest = await getLatest();

  return json({
    latest
  });
};

// Push rates to the shop metafields
export const action = async ({ request }: ActionFunctionArgs) => {
  const data = Object.fromEntries(await request.formData());
  const { admin, session } = await authenticate.admin(request);
  

  // Rest way
  const metafield = new admin.rest.resources.Metafield({session: session});
  metafield.namespace = "currency_converter";
  metafield.key = "exchange_rates";
  metafield.value = data.latest;
  metafield.type = "json";
  await metafield.save({ update: true });

  // GraphQL way, but dirst we need to take Shop ID
  /* const response = await admin.graphql(`{
    shop{
      id
    }
  }`);
  const shopData = await response.json();
  const shopId = shopData.data.shop.id
  console.log("SHOP ID: ", shopId);
  console.log("BEFORE GQL");
  await admin.graphql(`
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!){
      metafieldsSet(metafields: $metafields){
        metafields{
          key
          namespace
        }
        userErrors{
          field
          message
          code
        }
      }
    }
  `,
  {
    "metafields": [{
      "ownerId": `${shopId}`,
      "namespace": "currency_converter",
      "key": "exchange_rates_g",
      "value": "data.latest",
      "type": "json"
    }]
  });
  console.log("AFTER GQL"); */
  return null;
};

const EmptyStateMarkup = ({ onAction }) => (
  <EmptyState
    heading="Get the rates"
    action={{content: 'Get Rates', onAction}}
    image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
  >
    <p>
      There aren't any rates saved. Click the button below to get the latest currency rates, and get started with the app.
    </p>
  </EmptyState>
);

// Use resource list for the rates list https://polaris.shopify.com/components/lists/resource-list
const RatesTable = ({ rates }) => (
  <>
    <h1>{rates.currencies.length} Rates taken check prisma studio!!</h1>
  </>
);

export default function Index() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const {latest} = useLoaderData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  // Initiate ation to push the rates to the shop front-end
  const pushRates = () => {
    submit({latest: JSON.stringify(latest)}, { replace: true, method: "POST" });
  }
  const getRates = () => {
    navigate("/rates");
  };

  return (
    <Page>
      <ui-title-bar title="Remix app template">      
        <button variant="primary" onClick={getRates}>
          Get Rates
        </button>

      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              {latest === null || !latest.currencies.length ? (
                <EmptyStateMarkup onAction={getRates} />
              ) : (
                <RatesTable rates={latest} />
              )}
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Box background="bg-surface-selected">
                <Button 
                  size="large" 
                  primary 
                  onClick={() => pushRates()} 
                  loading={isLoading}
                  >
                  Update rates
                </Button>
            </Box>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
