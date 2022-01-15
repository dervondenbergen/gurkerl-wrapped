import { getJson, priceToCent } from "./helpers.js";

const user = await getJson("user");

console.log("Hallo", user.data.user.salutation, "\nHier sind ein paar interessante Statistiken:\n")

const deliveries = await getJson("total-2021");

const ordersOfLandliebeGrießpudding = deliveries.map(delivery => {
    const grießpudding = delivery.data.items.filter(item => {
        return item.name == "Landliebe Grießpudding Traditionell"
    })
    if (grießpudding.length > 0) {
        return grießpudding
    }
}).filter(grießpudding => grießpudding !== undefined);

console.log("Anzahl an Bestellungen", deliveries.length, "welche Landliebe beinhalten", ordersOfLandliebeGrießpudding.length);

const GRIESSPUDDIG_LARGE = 19446;
const GRIESSPUDDING_SMALL = 19441;

const puddings = {
    [GRIESSPUDDIG_LARGE]: {
        weight: 330,
        price: 129,
    },
    [GRIESSPUDDING_SMALL]: {
        weight: 125,
        price: 79
    }
}

const optimizedGrießpuddingList = ordersOfLandliebeGrießpudding.flat().map(grießpudding => {
    const { amount, id, priceComposition } = grießpudding;

    const isLarge = id === GRIESSPUDDIG_LARGE;

    const totalPrice = priceToCent(priceComposition.total.amount);
    const unitPrice = priceToCent(priceComposition.unit.amount);

    const weight = amount * puddings[id].weight;

    return {
        id,
        isLarge,
        amount,
        totalPrice,
        unitPrice,
        weight,
    }
});

const totalWeight = optimizedGrießpuddingList.reduce((gramms, order) => gramms + order.weight, 0)
const totalPrice = optimizedGrießpuddingList.reduce((cents, order) => cents + order.totalPrice, 0)

console.log("Gesamtgewicht", totalWeight / 1000, "kilogramm kosteten insgesamt", totalPrice / 100, "Euro");