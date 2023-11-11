import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getLatest, addNewCurrency, updateCurrency } from "../models/Latest.server";
import db from "../db.server"
import { Currency, Latest } from "@prisma/client";
import { getCurrency } from "~/models/Currency.server";

export const loader = async ({params}) => {
  const apiUrl = process.env.CURRENCY_API2;
  console.log(apiUrl);
  const response = await fetch(apiUrl);
  
  invariant(response.ok, "There was a problem with calling the rates API");

  const rates = await response.json();
  console.log(rates);
  let latest = await getLatest();
  if(latest === null)
  {
    latest = {} as Latest;
    latest.base = rates.base;
    latest = await db.latest.create({ data: latest });
  }
  
  for(let symbol in rates.rates)
  {
    const rate = rates.rates[symbol];

    const currencyData = {symbol: symbol, rate: rate} as Currency;
    let currency = latest?.currencies?.find((c) => c.symbol === symbol);
    
    if(currency){
      console.log("Update : " + symbol + " Currency", currency);
      // Update the existing currency with the new data
      updateCurrency({ latest, currency, currencyData });
    } else {
      // Create new currency to the latest list
      addNewCurrency({ latest, currencyData });
    }
  }

  return redirect("/app");
};