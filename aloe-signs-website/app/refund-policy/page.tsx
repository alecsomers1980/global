import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund and Return Policy | Aloe Signs',
    description: 'Refund and Return Policy for Aloe Signs.',
};

export default function RefundPolicy() {
    return (
        <div className="bg-bg-grey min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-charcoal mb-8">Refund and Return Policy</h1>

                <div className="prose prose-slate max-w-none text-medium-grey">
                    <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">1. Overview</h2>
                    <p>
                        At Aloe Signs, we strive to ensure that our customers are satisfied with their purchases. However, we understand that there may be occasions where you need to return items. This policy outlines our refund and return procedures in accordance with the Consumer Protection Act (CPA).
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">2. Custom Made Goods</h2>
                    <p>
                        Please note that the majority of our products are custom-made to your specifications (e.g., custom signage, branded estate agent boards). <strong>Custom-made goods are generally not eligible for return or refund</strong> unless they are defective or do not meet the agreed-upon specifications.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">3. Defective Products</h2>
                    <p>
                        If you receive a product that is defective or damaged, please notify us within 7 days of receipt. We will arrange for the inspection of the product and, if found to be defective due to our workmanship or materials, we will offer to repair, replace, or refund the item.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">4. Standard (Stock) Items</h2>
                    <p>
                        For non-custom items (e.g., standard safety signs), you may return the item within 7 days of receipt, provided that:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>The item is unused and in its original condition and packaging.</li>
                        <li>You have proof of purchase (order number or invoice).</li>
                    </ul>
                    <p className="mt-2">
                        A handling fee of up to 10% may be charged on returns of non-defective items. Shipping costs for returning non-defective items are the responsibility of the customer.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">5. Refunds</h2>
                    <p>
                        Refunds will be processed using the original method of payment. Please allow up to 7-10 working days for the refund to reflect in your account after we have approved the return.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">6. Cancellation of Orders</h2>
                    <p>
                        Orders for custom goods can only be cancelled if production has not yet commenced. If production has started, you may be liable for costs incurred up to that point. Orders for standard items may be cancelled prior to shipping, subject to a 10% administration fee.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">7. Contact Us</h2>
                    <p>
                        To initiate a return or if you have questions about this policy, please contact us at:
                    </p>
                    <p className="mt-2 text-charcoal font-semibold">
                        Email: team@aloesigns.co.za<br />
                        Phone: 011 693 2600
                    </p>
                </div>
            </div>
        </div>
    );
}
