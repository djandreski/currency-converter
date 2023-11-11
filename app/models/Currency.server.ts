import invariant from "tiny-invariant";
import db from "../db.server";

export async function getCurrency({symbol}){
    const currency = await db.currency.findFirst({where: {symbol: symbol}});

    if(!currency){
        return null;
    }

    return currency;
}

export async function addNewCurrency({ currencyData }){
    const createdCurr = await db.currency.create({data: currencyData});
    console.log("After Create : " + currencyData.symbol + " returned", createdCurr);
}

export function updateCurrency({ currency, currencyData }){
    db.latest.update({
        where: {id: currency?.id},
        data: currencyData 
    });
}