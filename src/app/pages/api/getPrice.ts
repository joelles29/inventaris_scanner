import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: string;
};

type SuccessResponse = {
    price: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
    if (req.method === 'POST') {
        const { sku } = req.body;
        try {
            const response = await fetch(`https://www.plant-trace.online/${sku}.html`);
            if (response.ok) {
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const priceElement = doc.querySelector('.detail-item .detail-value');
                if (priceElement && priceElement.textContent) {
                    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
                    res.status(200).json({ price: parseFloat(priceText) });
                } else {
                    throw new Error('Price element not found');
                }
            } else {
                throw new Error('Failed to fetch the page');
            }
        } catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
