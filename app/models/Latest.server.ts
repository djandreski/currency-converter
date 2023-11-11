import invariant from "tiny-invariant";
import db from "../db.server";

export async function getLatest(){
    const latest = await db.latest.findFirst({include: {currencies: true}});
    
    if(!latest){
        return null;
    }

    return latest;
}

export async function addNewCurrency({latest, currencyData}){
    const updatedLatest = await db.latest.update({
        where: {id: latest?.id},
        data: {
          currencies: {
            create: currencyData
          }
        },
        include: {
          currencies: true
        }
      });
    console.log("After Create : " + currencyData.symbol + " returned", updatedLatest);
}

export async function updateCurrency({latest, currency, currencyData}){
    await db.latest.update({
        where: {id: latest?.id},
        data: {
          currencies: {
            update: { 
              where: {id: currency?.id},
              data: currencyData 
            }
          }
        },
        include: {
          currencies: true
        }
      });
}