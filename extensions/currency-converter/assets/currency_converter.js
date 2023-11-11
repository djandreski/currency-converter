const header = document.querySelector("header");
const lastElement = header.lastElementChild;
const currenciesDropdown = document.querySelector(".currencyList");
lastElement.append(currenciesDropdown);

(() => {
    const baseCurrencyRate = ccRates.currencies.find((c) => c.symbol == ccBaseCurrency);

    const isElement = (element) => {
        return element instanceof Element || element instanceof Document;  
    }

    const updatePrices = (selectedCurrency) => {
        const selectedCurrencyRate = ccRates.currencies.find((c) => c.symbol == selectedCurrency);
        const moneyEls = document.querySelectorAll(".money");
        for (const index in moneyEls) {
            const moneyEl = moneyEls[index];
            if(!isElement(moneyEl)) continue;

            if(moneyEl.nextElementSibling){
                // Get the original price
            }

            const priceVal = moneyEl.textContent.match(/\d+\.?\d+/g)[0];
            const price = parseFloat(priceVal);
            const priceInBaseConvert = price / baseCurrencyRate.rate;
            const priceInSelCurrency = priceInBaseConvert * selectedCurrencyRate.rate;
            
            const convertedPriceVal = priceInSelCurrency.toFixed(2) + ` ${selectedCurrency}`;
            moneyEl.textContent = convertedPriceVal;
        }
    }

    currenciesDropdown.addEventListener("change", (e) => {
        const selectedCurrency = e.target.value;
        updatePrices(selectedCurrency);
    });
})()