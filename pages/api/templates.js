import { getAddressMaps, scripts } from "flow-catalog";

const handler = async (req, res) => {
    const addressMap = await getAddressMaps();
    const results = await scripts.getSupportedGeneratedTransactions(addressMap);

    if (results[0]) {
        res.setHeader("Cache-Control", "s-maxage=14400");
        res.status(200).json(results[0]);
    } else {
        res.status(500).json({ error: results[1] });
    }
};

export default handler;
