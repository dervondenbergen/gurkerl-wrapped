import { config } from "dotenv";
import { got } from "got";
import { getJson, saveJson } from "./helpers.js";

config()

const getSession = async () => {
    const savedCookie = await getJson("cookie");
    if (savedCookie) {
        return savedCookie;
    }

    const loginRequest = await got.post({
        url: "https://www.gurkerl.at/services/frontend-service/login",
        json: {
            email: process.env.GURKERL_MAIL,
            password: process.env.GURKERL_PASS,
        }
    });

    if (loginRequest.statusCode == 200) {
        const loginData = JSON.parse(loginRequest.body);
        const loginCookie = loginRequest.headers["set-cookie"];

        const savedCookie = await saveJson("cookie", loginCookie);
        const savedData = await saveJson("user", loginData);

        if (savedCookie) {
            return loginCookie;
        }
    }
}

const getDeliveries = async (year) => {
    const yearId = `deliveries-${year}`;
    
    const savedDeliveries = await getJson(yearId);
    if (savedDeliveries) {
        return savedDeliveries;
    }

    const cookie = await getSession();
    
    const deliveries = await got({
        url: "https://www.gurkerl.at/api/v3/orders/delivered",
        searchParams: {
            offset: 0,
            limit: 100,
        },
        headers: { cookie }
    }).json()

    if (deliveries) {
        const filteredDeliveries = deliveries.filter(delivery => {
            return (new Date(delivery.orderTime)).getFullYear() == year;
        });

        const savedDeliveries = saveJson(yearId, filteredDeliveries);

        if (savedDeliveries) {
            return filteredDeliveries;
        }
    }
}


const getDelivery = async (id) => {
    const deliveryId = `delivery-${id}`;

    const savedDelivery = await getJson(deliveryId);
    if (savedDelivery) {
        return savedDelivery;
    }

    const cookie = await getSession();

    const delivery = await got({
        url: `https://www.gurkerl.at/api/v3/orders/${id}`,
        headers: { cookie }
    }).json()
    
    if (delivery) {
        const savedDelivery = saveJson(deliveryId, delivery);

        if (savedDelivery) {
            return delivery;
        }
    }
}

const enrichDeliveries = async (deliveries, year) => {
    const enrichId = `total-${year}`;

    const savedEnriched = await getJson(enrichId);
    if (savedEnriched) {
        return savedEnriched;
    }

    const enrichedPromises = await Promise.allSettled(
        deliveries.map(async (delivery) => {
            const deliveryData = await getDelivery(delivery.id)
            delivery.data = deliveryData
            return delivery
        })
    );
    const enriched = enrichedPromises.map(delivery => delivery.value)

    if (enriched) {
        const savedEnriched = saveJson(enrichId, enriched);

        if (savedEnriched) {
            return savedEnriched;
        }
    }
}

const year = process.env.YEAR;

const cookie = await getSession();
const deliveries = await getDeliveries(year);
const enrichedDeliveries = await enrichDeliveries(deliveries, year);